# Place coordinate quality gate

Generert: 2026-07-04T09:03:26.267Z

## Oppsummering
- Aktive filer validert: **91**
- Antall steder validert: **911**
- Harde feil: **0**
- Varsler: **232**
- Coordinate review candidates: **502** signaler fordelt på **384** steder

Nivåene betyr:
- **Harde feil**: formelle koordinatfeil (ugyldig/manglende lat/lon/r, ødelagte anchors, manglende filer). Disse stopper gaten.
- **Varsler**: sannsynlige posisjonsrisikoer basert på enkle heuristikker.
- **Coordinate review candidates**: steder der repo-data alene ikke gir grunn til å stole på punktet. Signalene beviser ikke at posisjonen er feil – de peker ut kandidater for manuell kartkontroll.

## Beskyttede koordinater
Koordinater med `coordStatus=verified` eller `coordStatus=semantic_anchor` skal ikke overskrives av en manuell enkeltpatch uten ny `coordSource`, ny `coordNote` og eksplisitt begrunnelse for hvorfor tidligere koordinat var feil. Hvis et slikt sted flyttes mer enn 150 meter fra versjonen i `HEAD`, flagges endringen som `coordinate_regression_risk`.

## Aktive filer validert
- data/places/by/oslo/places_by.json
- data/places/film/oslo/places_oslo_film.json
- data/places/historie/oslo/places_historie.json
- data/places/historie/oslo/places_historie_added_batch_01.json
- data/places/historie/akershus/places_historie_akershus_batch1.json
- data/places/historie/akershus/places_historie_akershus_batch2.json
- data/places/historie/akershus/places_historie_akershus_batch3.json
- data/places/historie/akershus/places_historie_akershus_batch4.json
- data/places/historie/akershus/places_historie_akershus_batch5.json
- data/places/historie/ostfold/places_historie_ostfold_batch1.json
- data/places/historie/ostfold/places_historie_ostfold_batch2.json
- data/places/historie/ostfold/places_historie_ostfold_batch3.json
- data/places/historie/ostfold/places_historie_ostfold_batch4.json
- data/places/historie/ostfold/places_historie_ostfold_batch5.json
- data/places/historie/ostfold/places_historie_ostfold_batch6.json
- data/places/historie/buskerud/places_historie_buskerud_batch1.json
- data/places/historie/buskerud/places_historie_buskerud_batch2.json
- data/places/historie/buskerud/places_historie_buskerud_batch3.json
- data/places/historie/buskerud/places_historie_buskerud_batch4.json
- data/places/historie/buskerud/places_historie_buskerud_batch5.json
- data/places/historie/buskerud/places_historie_buskerud_batch6.json
- data/places/historie/innlandet/places_historie_innlandet_batch1.json
- data/places/historie/innlandet/places_historie_innlandet_batch2.json
- data/places/historie/innlandet/places_historie_innlandet_batch3.json
- data/places/historie/innlandet/places_historie_innlandet_batch4.json
- data/places/historie/innlandet/places_historie_innlandet_batch5.json
- data/places/historie/innlandet/places_historie_innlandet_batch6.json
- data/places/historie/innlandet/places_historie_innlandet_batch7.json
- data/places/historie/innlandet/places_historie_innlandet_batch8.json
- data/places/historie/innlandet/places_historie_innlandet_batch9.json
- data/places/historie/innlandet/places_historie_innlandet_batch10.json
- data/places/historie/innlandet/places_historie_innlandet_batch11.json
- data/places/historie/innlandet/places_historie_innlandet_batch12.json
- data/places/historie/innlandet/places_historie_innlandet_batch13.json
- data/places/historie/innlandet/places_historie_innlandet_batch14.json
- data/places/historie/innlandet/places_historie_innlandet_batch15.json
- data/places/historie/innlandet/places_historie_innlandet_batch16.json
- data/places/historie/innlandet/places_historie_innlandet_batch17.json
- data/places/historie/innlandet/places_historie_innlandet_batch18.json
- data/places/historie/vestfold/places_historie_vestfold_batch1.json
- data/places/historie/vestfold/places_historie_vestfold_batch2.json
- data/places/historie/vestfold/places_historie_vestfold_batch3.json
- data/places/historie/vestfold/places_historie_vestfold_batch4.json
- data/places/historie/vestfold/places_historie_vestfold_batch5.json
- data/places/historie/vestfold/places_historie_vestfold_batch6.json
- data/places/historie/vestfold/places_historie_vestfold_batch7.json
- data/places/historie/telemark/places_historie_telemark_batch1.json
- data/places/historie/telemark/places_historie_telemark_batch2.json
- data/places/historie/telemark/places_historie_telemark_batch3.json
- data/places/historie/norge/places_historie_norge_for_1500_batch1.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2.json
- data/places/historie/norge/places_historie_norge_for_1500_batch3.json
- data/places/historie/norge/places_historie_norge_for_1500_batch4.json
- data/places/kunst/oslo/places_kunst.json
- data/places/litteratur/oslo/places_litteratur.json
- data/places/media/oslo/places_oslo_media.json
- data/places/musikk/oslo/places_musikk.json
- data/places/naeringsliv/oslo/places_naeringsliv.json
- data/places/natur/oslo/places_oslo_alna.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json
- data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json
- data/places/natur/oslo/places_oslo_natur_bygdoy.json
- data/places/natur/oslo/places_oslo_natur_hovedsteder.json
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json
- data/places/natur/oslo/places_oslo_natur_ostensjovannet.json
- data/places/natur/oslo/places_oslo_natur_salamanderdammer.json
- data/places/politikk/oslo/places_politikk.json
- data/places/popkultur/oslo/places_oslo_populaerkultur.json
- data/places/sport/europa/norway/oslo_sport.json
- data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json
- data/places/sport/europa/norway/places_motorsport_ostlandet.json
- data/places/sport/europa/england/footballgrounds_london.json
- data/places/subkultur/oslo/places_subkultur.json
- data/places/vitenskap/oslo/places_vitenskap.json
- data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner.json
- data/places/psykologi/oslo/places_psykologi.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json
- data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json
- data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json
- data/places/sport/europa/portugal/footballgrounds_lisbon.json
- data/places/sport/europa/portugal/sportvenues_lisbon.json
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json
- data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json
- data/places/media/europe/portugal/lisbon/places_lisbon_media.json
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json
- data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json

## Harde feil
- Ingen

## Varsler
- data/places/by/oslo/places_by.json#torggata: lav koordinatpresisjon (<4 desimaler)
- data/places/by/oslo/places_by.json#gronland_basarene: lav koordinatpresisjon (<4 desimaler)
- data/places/by/oslo/places_by.json#ring_3: lineært sted uten anchors
- data/places/by/oslo/places_by.json#ring_3: lav koordinatpresisjon (<4 desimaler)
- data/places/by/oslo/places_by.json#trikk_17_18: lav koordinatpresisjon (<4 desimaler)
- data/places/by/oslo/places_by.json#kampen_kirke: lav koordinatpresisjon (<4 desimaler)
- data/places/by/oslo/places_by.json#jernbanetorget: lav koordinatpresisjon (<4 desimaler)
- data/places/by/oslo/places_by.json#gronlandsleiret: lav koordinatpresisjon (<4 desimaler)
- data/places/by/oslo/places_by.json#christiania_torv: lineært sted uten anchors
- data/places/by/oslo/places_by.json#stensparken: lav koordinatpresisjon (<4 desimaler)
- data/places/by/oslo/places_by.json#birkelunden: lav koordinatpresisjon (<4 desimaler)
- data/places/by/oslo/places_by.json#barcode: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/oslo/places_historie.json#damstredet_telthusbakken: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie.json#trefoldighetskirken: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/oslo/places_historie_added_batch_01.json#prinds_christian_augusts_minde: lineært sted uten anchors
- data/places/historie/akershus/places_historie_akershus_batch1.json#eidsvoll_verk_andelva: lineært sted uten anchors
- data/places/historie/akershus/places_historie_akershus_batch1.json#eidsvoll_verk_andelva: stort område uten coordNote/coordStatus
- data/places/historie/akershus/places_historie_akershus_batch1.json#tertitten_urskog_holandsbanen: stort område uten coordNote/coordStatus
- data/places/historie/akershus/places_historie_akershus_batch1.json#oscarsborg_festning: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/akershus/places_historie_akershus_batch1.json#trandumskogen: stort område uten coordNote/coordStatus
- data/places/historie/akershus/places_historie_akershus_batch3.json#hurdal_verk_glassverk: stort område uten coordNote/coordStatus
- data/places/historie/akershus/places_historie_akershus_batch4.json#hakadal_verk: stort område uten coordNote/coordStatus
- data/places/historie/akershus/places_historie_akershus_batch5.json#aurskog_holand_bygdetun: stort område uten coordNote/coordStatus
- data/places/historie/akershus/places_historie_akershus_batch5.json#nannestad_bygdemuseum: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/ostfold/places_historie_ostfold_batch2.json#hoytorp_fort: stort område uten coordNote/coordStatus
- data/places/historie/ostfold/places_historie_ostfold_batch3.json#tistedalen_saugbrugsforeningen: stort område uten coordNote/coordStatus
- data/places/historie/ostfold/places_historie_ostfold_batch4.json#akeroya_fort: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch1.json#veien_kulturminnepark: lineært sted uten anchors
- data/places/historie/buskerud/places_historie_buskerud_batch1.json#veien_kulturminnepark: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch1.json#uvdal_stavkirke: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch2.json#hallingdal_museum_nesbyen: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch3.json#eggedal_molle: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch3.json#drammen_tollbod_havn: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch4.json#laagdalsmuseet: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch4.json#fiskum_gamle_kirke: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/buskerud/places_historie_buskerud_batch4.json#hvalsmoen_leir: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/buskerud/places_historie_buskerud_batch4.json#dagali_museum: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/buskerud/places_historie_buskerud_batch5.json#hagan_skredsvig: lineært sted uten anchors
- data/places/historie/buskerud/places_historie_buskerud_batch5.json#gulskogen_gard: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch5.json#hemsedal_bygdatun: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch5.json#krokkleiva_kongeveien: lineært sted uten anchors
- data/places/historie/buskerud/places_historie_buskerud_batch6.json#lier_sykehus_historisk_omrade: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch6.json#vikersund_stasjon_randsfjordbanen: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch2.json#norsk_skogmuseum_elverum: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch2.json#glomdalsmuseet_elverum: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch3.json#hundorp_dale_gudbrand: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch3.json#folldal_gruver: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch3.json#raufoss_industripark_ammunisjon: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch4.json#elverum_folkehogskole_1940: lineært sted uten anchors
- data/places/historie/innlandet/places_historie_innlandet_batch5.json#oye_stavkirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch5.json#hedalen_stavkirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch6.json#finnetunet_skogfinsk_museum: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch6.json#sor_fron_kirke_gudbrandsdalsdomen: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch6.json#odalstunet_sor_odal: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch6.json#eidskog_museum_almenninga: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch7.json#proysenstua_rudshogda: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch7.json#rendalen_bygdemuseum: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch8.json#gausdal_bygdetun: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch9.json#husantunet_alvdal_bygdemuseum: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch9.json#koppangtunet_stor_elvdal: lineært sted uten anchors
- data/places/historie/innlandet/places_historie_innlandet_batch9.json#koppangtunet_stor_elvdal: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch9.json#tylldalen_bygdetun: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch10.json#nord_odal_bygdetun_sand: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch11.json#mustad_hunnselva_gjovik: lineært sted uten anchors
- data/places/historie/innlandet/places_historie_innlandet_batch11.json#mustad_hunnselva_gjovik: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch11.json#brumunddal_molle_industri: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch11.json#etnedal_bygdetun_bruflat: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch12.json#heidal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch13.json#espedalen_nikkelverk: lineært sted uten anchors
- data/places/historie/innlandet/places_historie_innlandet_batch13.json#espedalen_nikkelverk: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch13.json#aurdal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch14.json#sanderud_sykehus_historisk_omrade: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch14.json#otta_stasjon_gudbrandsdalen: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch14.json#romedal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch14.json#snertingdal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch15.json#elverum_stasjon_jernbanemiljo: lineært sted uten anchors
- data/places/historie/innlandet/places_historie_innlandet_batch15.json#os_kirke_osterdalen: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch16.json#moelv_stasjon_mjoslinjen: lineært sted uten anchors
- data/places/historie/innlandet/places_historie_innlandet_batch17.json#grue_finnskog_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch17.json#alvdal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch18.json#oyer_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch18.json#einunna_kraftverk_folldal: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch1.json#borrerhaugene_midgard: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch1.json#hvalfangstmuseet_sandefjord: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch2.json#molen_brunlanes_gravroysfelt: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch3.json#hoyjord_stavkirke: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch4.json#notteroy_kirke_faerder: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch4.json#kodal_kirke_sandefjord: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch5.json#sandefjord_kurbad: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch6.json#svarstad_kirke_lardal: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch7.json#bastoy_skolehjem_horten: lineært sted uten anchors
- data/places/historie/vestfold/places_historie_vestfold_batch7.json#bastoy_skolehjem_horten: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch7.json#sandefjord_stasjon_vestfoldbanen: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch1.json#heddal_stavkirke: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch1.json#heddal_stavkirke: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/telemark/places_historie_telemark_batch1.json#brekkeparken_skien: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch3.json#morgedal_norsk_skieventyr: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch3.json#dalen_hotel_tokke: stort område uten coordNote/coordStatus
- data/places/historie/norge/places_historie_norge_for_1500_batch1.json#stiklestad: lineært sted uten anchors
- data/places/historie/norge/places_historie_norge_for_1500_batch1.json#stiklestad: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch3.json#sekken_slagsted: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch3.json#vagar_lofoten_storvagan: lineært sted uten anchors
- data/places/historie/norge/places_historie_norge_for_1500_batch4.json#holmengra_hvaler: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch4.json#stamford_bridge_battlefield: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch4.json#jelling_kongsgard: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch4.json#orkney_birsay: lav koordinatpresisjon (<4 desimaler)
- data/places/litteratur/oslo/places_litteratur.json#alf_proysen_statue_nittedal: lav koordinatpresisjon (<4 desimaler)
- data/places/litteratur/oslo/places_litteratur.json#oscar_braaten_statuen: lav koordinatpresisjon (<4 desimaler)
- data/places/litteratur/oslo/places_litteratur.json#alexander_kiellands_plass: lav koordinatpresisjon (<4 desimaler)
- data/places/media/oslo/places_oslo_media.json#klassekampen_redaksjon: lineært sted uten anchors
- data/places/media/oslo/places_oslo_media.json#klassekampen_redaksjon: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/oslo/places_naeringsliv.json#fornebu_teknologipark: stort område uten coordNote/coordStatus
- data/places/naeringsliv/oslo/places_naeringsliv.json#akershus_energi: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/oslo/places_naeringsliv.json#ovre_foss: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/oslo/places_naeringsliv.json#oslo_kornmagasin: lineært sted uten anchors
- data/places/naeringsliv/oslo/places_naeringsliv.json#jernbanetorget_trafikknutepunkt: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/oslo/places_naeringsliv.json#oslo_kraftselskap: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/oslo/places_naeringsliv.json#frysja_industriomrade: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv.json#frysja_industriomrade: coordStatus=verified uten coordNote for område/gate/rute
- data/places/naeringsliv/oslo/places_naeringsliv.json#norges_varemesse: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/oslo/places_naeringsliv.json#bryn_industriomrade: stort område uten coordNote/coordStatus
- data/places/naeringsliv/oslo/places_naeringsliv.json#christiania_seildugsfabrik: lineært sted uten anchors
- data/places/naeringsliv/oslo/places_naeringsliv.json#akerselva_industri: lineært sted uten anchors
- data/places/naeringsliv/oslo/places_naeringsliv.json#akerselva_industri: stort område uten coordNote/coordStatus
- data/places/naeringsliv/oslo/places_naeringsliv.json#akerselva_industri: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_alna.json#alnaelva: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_alna.json#alnaelvstien: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_alna.json#alnaelvstien: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_alna.json#loelva_historisk: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_alna.json#loelva_historisk: stort område uten coordNote/coordStatus
- data/places/natur/oslo/places_oslo_alna.json#loelva_historisk: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_alna.json#trosterud_friomrade: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_alna.json#furuset_haugerud_skogbelte: stort område uten coordNote/coordStatus
- data/places/natur/oslo/places_oslo_alna.json#furuset_haugerud_skogbelte: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_alna.json#alnabru_jernbane_og_logistikk: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_alna.json#alnabru_jernbane_og_logistikk: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#nydalsdammen: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#stilla_nydalen: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#bjoelsenparken_elvenaer: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#voien_gard_voienvolden: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#elvestrekning_bla_brenneriveien: coordStatus=verified uten coordNote for område/gate/rute
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#elvestrekning_bla_brenneriveien: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#fossveien_elvestrekning: coordStatus=verified uten coordNote for område/gate/rute
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#hausmannsomradet_elvelop: coordStatus=verified uten coordNote for område/gate/rute
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#vaterland_historisk_elvelop: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#akerselva_utlop_bjorvika: coordStatus=verified uten coordNote for område/gate/rute
- data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json#alnaparken: coordStatus=verified uten coordNote for område/gate/rute
- data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json#svartdalen: coordStatus=verified uten coordNote for område/gate/rute
- data/places/natur/oslo/places_oslo_natur_hovedsteder.json#hovedoya: stort område uten coordNote/coordStatus
- data/places/natur/oslo/places_oslo_natur_hovedsteder.json#alnaelva_hovedsteder: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#noklevann_ljanselva_start: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#noklevann_ljanselva_start: coordStatus=verified uten coordNote for område/gate/rute
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#noklevann_ljanselva_start: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#ljanselva_skullerud: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#ljanselva_hauketo: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#ljanselva_hauketo: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#ljanselva_ljan: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#ljanselva_fiskevollen: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#ljanselva_bunnefjorden: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#ljanselva_bunnefjorden: coordStatus=verified uten coordNote for område/gate/rute
- data/places/natur/oslo/places_oslo_natur_ostensjovannet.json#ostensjovannet_nord: coordStatus=verified uten coordNote for område/gate/rute
- data/places/natur/oslo/places_oslo_natur_ostensjovannet.json#ostensjovannet_fugletarn: coordStatus=verified uten coordNote for område/gate/rute
- data/places/natur/oslo/places_oslo_natur_ostensjovannet.json#ostensjovannet_sor: coordStatus=verified uten coordNote for område/gate/rute
- data/places/natur/oslo/places_oslo_natur_salamanderdammer.json#tjernsmyr_salamanderlokalitet: lav koordinatpresisjon (<4 desimaler)
- data/places/popkultur/oslo/places_oslo_populaerkultur.json#house_of_nerds: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/europa/norway/oslo_sport.json#nordre_aasen_idrettspark: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json#lekeplass_sofienbergparken: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json#lekeplass_botsparken: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json#lekeplass_kirsebarlunden: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json#lekeplass_frognerborgen: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json#lekeplass_kampen_park: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json#treningssted_torshovdalen: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json#treningssted_kampen_park: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/europa/norway/places_motorsport_ostlandet.json#rudskogen_motorsenter: stort område uten coordNote/coordStatus
- data/places/sport/europa/norway/places_motorsport_ostlandet.json#gardermoen_motorpark: stort område uten coordNote/coordStatus
- data/places/sport/europa/norway/places_motorsport_ostlandet.json#finnskogbanen: stort område uten coordNote/coordStatus
- data/places/sport/europa/england/footballgrounds_london.json#wembley_stadium_london: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/europa/england/footballgrounds_london.json#stamford_bridge_london: lav koordinatpresisjon (<4 desimaler)
- data/places/subkultur/oslo/places_subkultur.json#bla: lav koordinatpresisjon (<4 desimaler)
- data/places/subkultur/oslo/places_subkultur.json#hausmannsgate_aksen: lineært sted uten anchors
- data/places/subkultur/oslo/places_subkultur.json#schweigaards_gate_lodalen: lineært sted uten anchors
- data/places/subkultur/oslo/places_subkultur.json#schweigaards_gate_lodalen: stort område uten coordNote/coordStatus
- data/places/subkultur/oslo/places_subkultur.json#kuba_akselpassasjer: lineært sted uten anchors
- data/places/subkultur/oslo/places_subkultur.json#brenneriveien_ingens_gate: lineært sted uten anchors
- data/places/subkultur/oslo/places_subkultur.json#brenneriveien_ingens_gate: lav koordinatpresisjon (<4 desimaler)
- data/places/vitenskap/oslo/places_vitenskap.json#universitetet_i_oslo_blindern: lav koordinatpresisjon (<4 desimaler)
- data/places/vitenskap/oslo/places_vitenskap.json#rikshospitalet: lav koordinatpresisjon (<4 desimaler)
- data/places/vitenskap/oslo/places_vitenskap.json#radiumhospitalet: lav koordinatpresisjon (<4 desimaler)
- data/places/vitenskap/oslo/places_vitenskap.json#meteorologisk_institutt: lineært sted uten anchors
- data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner.json#nobelinstituttet: lineært sted uten anchors
- data/places/psykologi/oslo/places_psykologi.json#psykologisk_institutt_uio: lineært sted uten anchors
- data/places/by/europe/portugal/lisbon/places_lisbon_by.json#lisbon_alfama: lav koordinatpresisjon (<4 desimaler)
- data/places/by/europe/portugal/lisbon/places_lisbon_by.json#lisbon_lapa: lav koordinatpresisjon (<4 desimaler)
- data/places/by/europe/portugal/lisbon/places_lisbon_by.json#lisbon_ajuda: lav koordinatpresisjon (<4 desimaler)
- data/places/by/europe/portugal/lisbon/places_lisbon_by.json#lisbon_martim_moniz_mouraria_axis: lav koordinatpresisjon (<4 desimaler)
- data/places/by/europe/portugal/lisbon/places_lisbon_by.json#lisbon_gare_do_cais_do_sodre: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json#lisbon_torre_de_belem: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json#lisbon_se_de_lisboa: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json#lisbon_palacio_fronteira: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json#lisbon_igreja_de_santo_antonio: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json#lisbon_museu_do_aljube: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json#lisbon_museu_de_marinha: lav koordinatpresisjon (<4 desimaler)
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json#lisbon_praca_marques_de_pombal: lav koordinatpresisjon (<4 desimaler)
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json#lisbon_praca_do_municipio: lav koordinatpresisjon (<4 desimaler)
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json#lisbon_tribunal_constitucional: lineært sted uten anchors
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json#lisbon_avenida_24_de_julho: lav koordinatpresisjon (<4 desimaler)
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json#lisbon_centro_cultural_de_belem: lav koordinatpresisjon (<4 desimaler)
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json#lisbon_museu_do_oriente: lav koordinatpresisjon (<4 desimaler)
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json#lisbon_teatro_nacional_d_maria_ii: lav koordinatpresisjon (<4 desimaler)
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json#lisbon_museu_arpad_szenes_vieira_da_silva: lav koordinatpresisjon (<4 desimaler)
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json#lisbon_museu_bordalo_pinheiro: lav koordinatpresisjon (<4 desimaler)
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json#lisbon_gremio_literario: lav koordinatpresisjon (<4 desimaler)
- data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json#lisbon_clube_de_fado: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json#lisbon_parque_das_nacoes: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json#lisbon_conserveira_de_lisboa: lineært sted uten anchors
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json#lisbon_santa_apolonia_station: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/europa/portugal/sportvenues_lisbon.json#lisbon_centro_nautico_de_belem: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json#lisbon_miradouro_da_senhora_do_monte: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json#lisbon_tapada_da_ajuda: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json#lisbon_jardim_gulbenkian: lav koordinatpresisjon (<4 desimaler)
- data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json#lisbon_cinema_ideal: lav koordinatpresisjon (<4 desimaler)
- data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json#lisbon_tobis_portuguesa: lav koordinatpresisjon (<4 desimaler)
- data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json#lisbon_doclisboa: lineært sted uten anchors
- data/places/media/europe/portugal/lisbon/places_lisbon_media.json#lisbon_rtp: lav koordinatpresisjon (<4 desimaler)
- data/places/media/europe/portugal/lisbon/places_lisbon_media.json#lisbon_arquivo_rtp: lav koordinatpresisjon (<4 desimaler)
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json#lisbon_instituto_superior_tecnico: lineært sted uten anchors
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json#lisbon_instituto_higiene_medicina_tropical: lineært sted uten anchors
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json#lisbon_instituto_higiene_medicina_tropical: lav koordinatpresisjon (<4 desimaler)
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json#lisbon_instituto_ricardo_jorge: lineært sted uten anchors
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json#lisbon_champalimaud_foundation: lav koordinatpresisjon (<4 desimaler)
- data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json#lisbon_santo_antonio_festival: lineært sted uten anchors
- data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json#lisbon_feira_do_livro: lav koordinatpresisjon (<4 desimaler)

## Coordinate review candidates

Totalt 502 signaler fordelt på 384 steder. Et sted kan ha flere signaler. Kandidatene under er gruppert etter grunn.

### Antall per grunn

| Grunn | Antall |
| --- | --- |
| lav koordinatpresisjon (<4 desimaler) | 96 |
| lineært sted uten anchors | 46 |
| stasjon/park/gate/torg/elv uten coordinate metadata | 80 |
| coordStatus=verified uten coordPrecisionM | 2 |
| park/stort område uten anchors eller coordNote | 77 |
| svært stor r (>=500 m) uten coordNote | 26 |
| identisk/nesten identisk lat/lon som annet sted uten forklaring | 16 |
| ligger svært langt fra de andre stedene i samme fil | 159 |

### lav koordinatpresisjon (<4 desimaler) (96)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| torggata | Torggata | by | data/places/by/oslo/places_by.json | 59.915 | 10.7526 | 180 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| gronland_basarene | Grønland basarene | by | data/places/by/oslo/places_by.json | 59.9125 | 10.765 | 150 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| ring_3 | Ring 3 | by | data/places/by/oslo/places_by.json | 59.931 | 10.792 | 400 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| trikk_17_18 | Trikkelinje 17/18 | by | data/places/by/oslo/places_by.json | 59.92 | 10.76 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| kampen_kirke | Kampen kirke | by | data/places/by/oslo/places_by.json | 59.912 | 10.782 | 160 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| jernbanetorget | Jernbanetorget | by | data/places/by/oslo/places_by.json | 59.911 | 10.75 | 180 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| gronlandsleiret | Grønlandsleiret | by | data/places/by/oslo/places_by.json | 59.9116 | 10.767 | 210 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| stensparken | Stensparken | by | data/places/by/oslo/places_by.json | 59.9272 | 10.733 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| birkelunden | Birkelunden | by | data/places/by/oslo/places_by.json | 59.927 | 10.7601 | 190 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| barcode | Barcode | by | data/places/by/oslo/places_by.json | 59.908 | 10.7602 | 210 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| trefoldighetskirken | Trefoldighetskirken | historie | data/places/historie/oslo/places_historie.json | 59.9183 | 10.746 | 110 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| oscarsborg_festning | Oscarsborg festning | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 59.676 | 10.606 | 360 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| nannestad_bygdemuseum | Nannestad bygdemuseum | historie | data/places/historie/akershus/places_historie_akershus_batch5.json | 60.217 | 11.012 | 260 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| fiskum_gamle_kirke | Fiskum gamle kirke | historie | data/places/historie/buskerud/places_historie_buskerud_batch4.json | 59.7069 | 9.805 | 260 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| hvalsmoen_leir | Hvalsmoen leir | historie | data/places/historie/buskerud/places_historie_buskerud_batch4.json | 60.207 | 10.277 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| dagali_museum | Dagali Museum | historie | data/places/historie/buskerud/places_historie_buskerud_batch4.json | 60.415 | 8.448 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| heddal_stavkirke | Heddal stavkirke | historie | data/places/historie/telemark/places_historie_telemark_batch1.json | 59.5794 | 9.176 | 360 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| stiklestad | Stiklestad | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | 63.7956 | 11.559 | 220 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| sekken_slagsted | Sekken slagsted og minnestein | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 62.647 | 7.3678 | 320 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| holmengra_hvaler | Holmengrå ved Hvaler | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 59.027 | 11.045 | 650 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| stamford_bridge_battlefield | Stamford Bridge battlefield | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 53.989 | -0.903 | 650 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| jelling_kongsgard | Jelling kongsgård og monumentområde | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 55.756 | 9.419 | 320 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| orkney_birsay | Brough of Birsay / Orknøyene | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 59.136 | -3.322 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| alf_proysen_statue_nittedal | Alf Prøysen-statuen – Nittedal kulturhus | litteratur | data/places/litteratur/oslo/places_litteratur.json | 60.062 | 10.875 | 120 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| oscar_braaten_statuen | Oscar Braaten-statuen | litteratur | data/places/litteratur/oslo/places_litteratur.json | 59.938 | 10.76 | 150 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| alexander_kiellands_plass | Alexander Kiellands plass | litteratur | data/places/litteratur/oslo/places_litteratur.json | 59.9245 | 10.766 | 120 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| klassekampen_redaksjon | Klassekampen-redaksjonen (Hausmanns gate) | media | data/places/media/oslo/places_oslo_media.json | 59.917 | 10.756 | 120 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| akershus_energi | Akershus Energi Varme | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.947 | 10.8355 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| ovre_foss | Øvre Foss – Hjula Veveri | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9276 | 10.755 | 180 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| jernbanetorget_trafikknutepunkt | Jernbanetorget – handelsknutepunktet | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.911 | 10.7508 | 150 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| oslo_kraftselskap | Oslo Lysverker | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.919 | 10.7479 | 140 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| norges_varemesse | Norges Varemesse | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.953 | 10.7525 | 250 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| akerselva_industri | Akerselva industriområde | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9286 | 10.758 | 260 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| alnaelva | Alnaelva | natur | data/places/natur/oslo/places_oslo_alna.json | 59.9325 | 10.833 | 400 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| alnaelvstien | Alnaelvstien | natur | data/places/natur/oslo/places_oslo_alna.json | 59.931 | 10.83 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| loelva_historisk | Loelva (historisk vassdrag) | natur | data/places/natur/oslo/places_oslo_alna.json | 59.928 | 10.82 | 250 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| trosterud_friomrade | Trosterud friområde | natur | data/places/natur/oslo/places_oslo_alna.json | 59.9305 | 10.846 | 220 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| furuset_haugerud_skogbelte | Furuset–Haugerud skogbelte | natur | data/places/natur/oslo/places_oslo_alna.json | 59.9345 | 10.852 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| alnabru_jernbane_og_logistikk | Alnabru – jernbane og logistikk | by | data/places/natur/oslo/places_oslo_alna.json | 59.936 | 10.814 | 350 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| nydalsdammen | Nydalsdammen | natur | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.9458 | 10.766 | 120 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| voien_gard_voienvolden | Vøien gård / Vøienvolden | historie | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.935 | 10.7535 | 180 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | natur | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.923 | 10.7407 | 130 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| alnaelva_hovedsteder | Alnaelva | natur | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | 59.9325 | 10.833 | 500 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | 59.8836 | 10.878 | 150 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| ljanselva_hauketo | Ljanselva ved Hauketo | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | 59.8485 | 10.816 | 180 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | natur | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | 59.911 | 10.62714 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| house_of_nerds | House of Nerds | populaerkultur | data/places/popkultur/oslo/places_oslo_populaerkultur.json | 59.923 | 10.7506 | 120 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| nordre_aasen_idrettspark | Nordre Åsen idrettspark | sport | data/places/sport/europa/norway/oslo_sport.json | 59.942778 | 10.785 | 170 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lekeplass_sofienbergparken | Sofienbergparken lekeplass | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9229 | 10.763 | 120 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lekeplass_botsparken | Botsparken lekeplass | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9053 | 10.769 | 110 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lekeplass_kirsebarlunden | Kirsebærlunden lekeplass | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.916 | 10.7756 | 130 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lekeplass_frognerborgen | Frognerborgen | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.927 | 10.7003 | 140 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lekeplass_kampen_park | Kampen park lekeplass | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9148 | 10.779 | 140 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| treningssted_torshovdalen | Torshovdalen trenings- og aktivitetspark | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9368 | 10.777 | 220 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| treningssted_kampen_park | Kampen park treningssted | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9148 | 10.779 | 170 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| wembley_stadium_london | Wembley Stadium | sport | data/places/sport/europa/england/footballgrounds_london.json | 51.556 | -0.2796 | 250 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| stamford_bridge_london | Stamford Bridge | sport | data/places/sport/europa/england/footballgrounds_london.json | 51.4817 | -0.191 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| bla | Blå | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9186 | 10.757 | 90 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9186 | 10.757 | 180 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| universitetet_i_oslo_blindern | Universitetet i Oslo, Blindern | vitenskap | data/places/vitenskap/oslo/places_vitenskap.json | 59.9393 | 10.723 | 220 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| rikshospitalet | Rikshospitalet | vitenskap | data/places/vitenskap/oslo/places_vitenskap.json | 59.948 | 10.7082 | 190 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| radiumhospitalet | Radiumhospitalet | vitenskap | data/places/vitenskap/oslo/places_vitenskap.json | 59.919 | 10.6677 | 170 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_alfama | Alfama | by | data/places/by/europe/portugal/lisbon/places_lisbon_by.json | 38.7115 | -9.13 | 500 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_lapa | Lapa | by | data/places/by/europe/portugal/lisbon/places_lisbon_by.json | 38.708 | -9.1602 | 400 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_ajuda | Ajuda | by | data/places/by/europe/portugal/lisbon/places_lisbon_by.json | 38.7066 | -9.199 | 600 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_martim_moniz_mouraria_axis | Martim Moniz–Mouraria-aksen | by | data/places/by/europe/portugal/lisbon/places_lisbon_by.json | 38.717 | -9.1361 | 350 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_gare_do_cais_do_sodre | Gare do Cais do Sodré | by | data/places/by/europe/portugal/lisbon/places_lisbon_by.json | 38.706 | -9.1448 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_torre_de_belem | Torre de Belém | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json | 38.6916 | -9.216 | 150 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_se_de_lisboa | Sé de Lisboa | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json | 38.7099 | -9.133 | 120 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_palacio_fronteira | Palácio dos Marqueses de Fronteira | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json | 38.7445 | -9.19 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_igreja_de_santo_antonio | Igreja de Santo António | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json | 38.711 | -9.1335 | 100 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_museu_do_aljube | Museu do Aljube – Resistência e Liberdade | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json | 38.711 | -9.1314 | 100 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_museu_de_marinha | Museu de Marinha | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json | 38.6976 | -9.207 | 150 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_praca_marques_de_pombal | Praça Marquês de Pombal | politikk | data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json | 38.725 | -9.15 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_praca_do_municipio | Praça do Município / Câmara Municipal de Lisboa | politikk | data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json | 38.708 | -9.137 | 120 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_avenida_24_de_julho | Avenida 24 de Julho | politikk | data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json | 38.705 | -9.1556 | 600 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_centro_cultural_de_belem | Centro Cultural de Belém | kunst | data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json | 38.696 | -9.207 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_museu_do_oriente | Museu do Oriente | kunst | data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json | 38.706 | -9.1828 | 100 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_teatro_nacional_d_maria_ii | Teatro Nacional D. Maria II | kunst | data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json | 38.714 | -9.139 | 80 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_museu_arpad_szenes_vieira_da_silva | Museu Arpad Szenes – Vieira da Silva | kunst | data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json | 38.718 | -9.1543 | 80 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_museu_bordalo_pinheiro | Museu Bordalo Pinheiro | kunst | data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json | 38.7367 | -9.153 | 80 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_gremio_literario | Grémio Literário | litteratur | data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json | 38.711 | -9.1428 | 60 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_clube_de_fado | Clube de Fado | musikk | data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json | 38.71 | -9.1297 | 60 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_parque_das_nacoes | Parque das Nações | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json | 38.7681 | -9.095 | 800 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_santa_apolonia_station | Santa Apolónia Station | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json | 38.714 | -9.1228 | 180 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_centro_nautico_de_belem | Centro Náutico de Belém | sport | data/places/sport/europa/portugal/sportvenues_lisbon.json | 38.696 | -9.2076 | 250 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_miradouro_da_senhora_do_monte | Miradouro da Senhora do Monte | natur | data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json | 38.718 | -9.1335 | 80 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_tapada_da_ajuda | Tapada da Ajuda | natur | data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json | 38.7077 | -9.19 | 1200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_jardim_gulbenkian | Jardim da Fundação Calouste Gulbenkian | natur | data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json | 38.737 | -9.1535 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_cinema_ideal | Cinema Ideal | film_tv | data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json | 38.71 | -9.1457 | 80 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_tobis_portuguesa | Tobis Portuguesa | film_tv | data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json | 38.767 | -9.1597 | 250 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_rtp | RTP – Rádio e Televisão de Portugal | media | data/places/media/europe/portugal/lisbon/places_lisbon_media.json | 38.76 | -9.1153 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_arquivo_rtp | Arquivo RTP | media | data/places/media/europe/portugal/lisbon/places_lisbon_media.json | 38.7607 | -9.114 | 150 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_instituto_higiene_medicina_tropical | Instituto de Higiene e Medicina Tropical | vitenskap | data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json | 38.7041 | -9.201 | 150 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_champalimaud_foundation | Fundação Champalimaud | vitenskap | data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json | 38.6935 | -9.219 | 250 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_feira_do_livro | Feira do Livro de Lisboa | populaerkultur | data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json | 38.727 | -9.1542 | 350 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |

### lineært sted uten anchors (46)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ring_3 | Ring 3 | by | data/places/by/oslo/places_by.json | 59.931 | 10.792 | 400 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| christiania_torv | Christiania Torv | by | data/places/by/oslo/places_by.json | 59.9104 | 10.7397 | 150 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| prinds_christian_augusts_minde | Prinds Christian Augusts Minde | historie | data/places/historie/oslo/places_historie_added_batch_01.json | 59.915289 | 10.75595 | 120 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| eidsvoll_verk_andelva | Eidsvoll Verk / Andelva | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 60.3297 | 11.2575 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| veien_kulturminnepark | Veien Kulturminnepark | historie | data/places/historie/buskerud/places_historie_buskerud_batch1.json | 60.1842 | 10.2504 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| hagan_skredsvig | Hagan / Christian Skredsvigs kunstnerhjem | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 60.2269 | 9.3317 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| krokkleiva_kongeveien | Krokkleiva / Den bergenske kongevei | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 60.0609 | 10.3092 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| elverum_folkehogskole_1940 | Elverum folkehøgskole / Elverumsfullmakten | historie | data/places/historie/innlandet/places_historie_innlandet_batch4.json | 60.8828 | 11.5599 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| koppangtunet_stor_elvdal | Koppangtunet / Stor-Elvdal museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 61.5708 | 11.0552 | 320 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| mustad_hunnselva_gjovik | Mustad / Hunnselva industrimiljø | historie | data/places/historie/innlandet/places_historie_innlandet_batch11.json | 60.7894 | 10.6798 | 360 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| espedalen_nikkelverk | Espedalen nikkelverk | historie | data/places/historie/innlandet/places_historie_innlandet_batch13.json | 61.4248 | 9.6036 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| elverum_stasjon_jernbanemiljo | Elverum stasjon / jernbanemiljø | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 60.8818 | 11.5621 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| moelv_stasjon_mjoslinjen | Moelv stasjon / Mjøslinjen | historie | data/places/historie/innlandet/places_historie_innlandet_batch16.json | 60.9337 | 10.7005 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| bastoy_skolehjem_horten | Bastøy skolehjem / institusjonshistorisk sted | historie | data/places/historie/vestfold/places_historie_vestfold_batch7.json | 59.3869 | 10.5318 | 620 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| stiklestad | Stiklestad | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | 63.7956 | 11.559 | 220 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| vagar_lofoten_storvagan | Vågar i Storvågan/Kabelvåg | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 68.2145 | 14.4759 | 260 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| klassekampen_redaksjon | Klassekampen-redaksjonen (Hausmanns gate) | media | data/places/media/oslo/places_oslo_media.json | 59.917 | 10.756 | 120 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| oslo_kornmagasin | Christiania kornmagasin | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9119 | 10.7428 | 120 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| christiania_seildugsfabrik | Christiania Seildugsfabrik | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9297 | 10.7576 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| akerselva_industri | Akerselva industriområde | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9286 | 10.758 | 260 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| alnaelvstien | Alnaelvstien | natur | data/places/natur/oslo/places_oslo_alna.json | 59.931 | 10.83 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| loelva_historisk | Loelva (historisk vassdrag) | natur | data/places/natur/oslo/places_oslo_alna.json | 59.928 | 10.82 | 250 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| alnabru_jernbane_og_logistikk | Alnabru – jernbane og logistikk | by | data/places/natur/oslo/places_oslo_alna.json | 59.936 | 10.814 | 350 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| stilla_nydalen | Stilla ved Nydalen | natur | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.9449 | 10.7654 | 120 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| bjoelsenparken_elvenaer | Bjølsenparken (elvenær del) | natur | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.9386 | 10.7588 | 160 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| vaterland_historisk_elvelop | Vaterland – historisk elveløp | historie | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.9158 | 10.7332 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | 59.8836 | 10.878 | 150 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_skullerud | Ljanselva ved Skullerud | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | 59.8642 | 10.8423 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_hauketo | Ljanselva ved Hauketo | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | 59.8485 | 10.816 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_ljan | Ljanselva ved Ljan | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | 59.8359 | 10.8099 | 170 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_fiskevollen | Ljanselva ved Fiskevollen | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | 59.8319 | 10.8048 | 140 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | 59.8288 | 10.8034 | 120 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| hausmannsgate_aksen | Hausmannsgate-aksen | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9189 | 10.7513 | 240 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| schweigaards_gate_lodalen | Schweigaards gate–Lodalen veggakse | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9077 | 10.7725 | 260 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kuba_akselpassasjer | Kuba-passasjene ved Akerselva | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9236 | 10.7558 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9186 | 10.757 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| meteorologisk_institutt | Meteorologisk institutt | vitenskap | data/places/vitenskap/oslo/places_vitenskap.json | 59.9429 | 10.7188 | 150 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| nobelinstituttet | Nobelinstituttet | vitenskap | data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner.json | 59.9198 | 10.7489 | 150 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| psykologisk_institutt_uio | Psykologisk institutt, UiO | psykologi | data/places/psykologi/oslo/places_psykologi.json | 59.9419 | 10.7229 | 160 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lisbon_tribunal_constitucional | Tribunal Constitucional / Palácio Ratton | politikk | data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json | 38.7227 | -9.1421 | 100 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lisbon_conserveira_de_lisboa | Conserveira de Lisboa | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json | 38.7098 | -9.1374 | 60 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lisbon_doclisboa | Doclisboa – Festival Internacional de Cinema | film_tv | data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json | 38.7202 | -9.1463 | 250 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lisbon_instituto_superior_tecnico | Instituto Superior Técnico | vitenskap | data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json | 38.7368 | -9.1395 | 400 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lisbon_instituto_higiene_medicina_tropical | Instituto de Higiene e Medicina Tropical | vitenskap | data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json | 38.7041 | -9.201 | 150 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lisbon_instituto_ricardo_jorge | Instituto Nacional de Saúde Doutor Ricardo Jorge | vitenskap | data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json | 38.7693 | -9.1789 | 250 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lisbon_santo_antonio_festival | Santo António-festivalen i Lisboa | populaerkultur | data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json | 38.7117 | -9.1297 | 700 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |

### stasjon/park/gate/torg/elv uten coordinate metadata (80)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| middelalder_oslo | Middelalderparken | historie | data/places/historie/oslo/places_historie.json | 59.9048 | 10.7605 | 180 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| nostvet_boplass | Nøstvet-boplassen | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 59.75109 | 10.7996 | 220 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| eidsvoll_verk_andelva | Eidsvoll Verk / Andelva | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 60.3297 | 11.2575 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kjeller_flyplass | Kjeller flyplass | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 59.96944 | 11.03889 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| stunner_boplass | Stunner steinalderboplass | historie | data/places/historie/akershus/places_historie_akershus_batch3.json | 59.74657 | 10.91747 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kornsjo_grensestasjon | Kornsjø stasjon / grensestasjon | historie | data/places/historie/ostfold/places_historie_ostfold_batch4.json | 59.0974 | 11.6682 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| momarken_markedsplass | Momarken markedsplass | historie | data/places/historie/ostfold/places_historie_ostfold_batch6.json | 59.5584 | 11.3229 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| veien_kulturminnepark | Veien Kulturminnepark | historie | data/places/historie/buskerud/places_historie_buskerud_batch1.json | 60.1842 | 10.2504 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kroderbanen_kroderen_stasjon | Krøderbanen / Krøderen stasjon | historie | data/places/historie/buskerud/places_historie_buskerud_batch2.json | 60.1359 | 9.7829 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| vikersund_stasjon_randsfjordbanen | Vikersund stasjon / Randsfjordbanen | historie | data/places/historie/buskerud/places_historie_buskerud_batch6.json | 59.9655 | 9.9986 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| raufoss_industripark_ammunisjon | Raufoss industripark / ammunisjonsfabrikken | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 60.7299 | 10.6164 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| elverum_folkehogskole_1940 | Elverum folkehøgskole / Elverumsfullmakten | historie | data/places/historie/innlandet/places_historie_innlandet_batch4.json | 60.8828 | 11.5599 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| hamar_stasjon_jernbanebyen | Hamar stasjon / jernbanebyen | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.7949 | 11.0678 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| koppangtunet_stor_elvdal | Koppangtunet / Stor-Elvdal museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 61.5708 | 11.0552 | 320 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| mustad_hunnselva_gjovik | Mustad / Hunnselva industrimiljø | historie | data/places/historie/innlandet/places_historie_innlandet_batch11.json | 60.7894 | 10.6798 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| eina_stasjon_totenbanen | Eina stasjon / Totenbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch12.json | 60.6286 | 10.5988 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| espedalen_nikkelverk | Espedalen nikkelverk | historie | data/places/historie/innlandet/places_historie_innlandet_batch13.json | 61.4248 | 9.6036 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| fagernes_stasjon_valdresbanen | Fagernes stasjon / Valdresbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch13.json | 60.9856 | 9.2339 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lillehammer_stasjon | Lillehammer stasjon | historie | data/places/historie/innlandet/places_historie_innlandet_batch13.json | 61.1152 | 10.4637 | 280 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| dombas_stasjon_jernbaneknutepunkt | Dombås stasjon / jernbaneknutepunkt | historie | data/places/historie/innlandet/places_historie_innlandet_batch14.json | 62.0697 | 9.1239 | 320 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| otta_stasjon_gudbrandsdalen | Otta stasjon / Gudbrandsdalen | historie | data/places/historie/innlandet/places_historie_innlandet_batch14.json | 61.7712 | 9.5352 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kongsvinger_stasjon_grensebanen | Kongsvinger stasjon / grensebanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch14.json | 60.1907 | 12.0007 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| elverum_stasjon_jernbanemiljo | Elverum stasjon / jernbanemiljø | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 60.8818 | 11.5621 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| tynset_stasjon_rorosbanen | Tynset stasjon / Rørosbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 62.2757 | 10.7828 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| moelv_stasjon_mjoslinjen | Moelv stasjon / Mjøslinjen | historie | data/places/historie/innlandet/places_historie_innlandet_batch16.json | 60.9337 | 10.7005 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| stange_stasjon_dovrebanen | Stange stasjon / Dovrebanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch16.json | 60.7181 | 11.1941 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| gran_stasjon_gjovikbanen | Gran stasjon / Gjøvikbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch16.json | 60.3665 | 10.5608 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lena_stasjon_totenbanen | Lena stasjon / Totenbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch16.json | 60.6744 | 10.8138 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| reinsvoll_stasjon_totenbanen | Reinsvoll stasjon / Totenbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch16.json | 60.6798 | 10.6225 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| dokka_stasjon_valdresbanen | Dokka stasjon / Valdresbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch16.json | 60.8352 | 10.0719 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| skarnes_stasjon_kongsvingerbanen | Skarnes stasjon / Kongsvingerbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch16.json | 60.2536 | 11.6819 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| skreia_stasjon_totenbanen | Skreia stasjon / Totenbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 60.6504 | 10.9357 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| flisa_stasjon_solorbanen | Flisa stasjon / Solørbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 60.6095 | 12.0116 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| os_stasjon_rorosbanen | Os stasjon / Rørosbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch18.json | 62.4957 | 11.2235 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| borrerhaugene_midgard | Borreparken / Borre-haugene | historie | data/places/historie/vestfold/places_historie_vestfold_batch1.json | 59.3805 | 10.4686 | 620 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| horten_stasjon_vestfoldbanen | Horten stasjon / Vestfoldbanen | historie | data/places/historie/vestfold/places_historie_vestfold_batch7.json | 59.4129 | 10.4825 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| tonsberg_stasjon_vestfoldbanen | Tønsberg stasjon / Vestfoldbanen | historie | data/places/historie/vestfold/places_historie_vestfold_batch7.json | 59.2709 | 10.4121 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| sandefjord_stasjon_vestfoldbanen | Sandefjord stasjon / Vestfoldbanen | historie | data/places/historie/vestfold/places_historie_vestfold_batch7.json | 59.1317 | 10.2244 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| larvik_stasjon_vestfoldbanen | Larvik stasjon / Vestfoldbanen | historie | data/places/historie/vestfold/places_historie_vestfold_batch7.json | 59.0525 | 10.0352 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| brekkeparken_skien | Brekkeparken Skien | historie | data/places/historie/telemark/places_historie_telemark_batch1.json | 59.2072 | 9.6005 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| rjukanbanen_rjukan_stasjon | Rjukanbanen / Rjukan stasjon | historie | data/places/historie/telemark/places_historie_telemark_batch2.json | 59.8789 | 8.5927 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| tinnoset_stasjon_tinnosbanen | Tinnoset stasjon / Tinnosbanen | historie | data/places/historie/telemark/places_historie_telemark_batch2.json | 59.7048 | 9.0362 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| ekebergparken | Ekebergparken skulpturpark | kunst | data/places/kunst/oslo/places_kunst.json | 59.8997 | 10.7753 | 200 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| inger_hagerups_plass | Inger Hagerups plass | litteratur | data/places/litteratur/oslo/places_litteratur.json | 59.9427 | 10.8553 | 130 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| alexander_kiellands_plass | Alexander Kiellands plass | litteratur | data/places/litteratur/oslo/places_litteratur.json | 59.9245 | 10.766 | 120 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| klassekampen_redaksjon | Klassekampen-redaksjonen (Hausmanns gate) | media | data/places/media/oslo/places_oslo_media.json | 59.917 | 10.756 | 120 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| fornebu_teknologipark | Fornebu Teknologipark | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.8939 | 10.6262 | 400 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| ulven_handelspark | Ulven handelspark | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9229 | 10.8215 | 200 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| jernbanetorget_trafikknutepunkt | Jernbanetorget – handelsknutepunktet | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.911 | 10.7508 | 150 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| vippetangen_fisketorg | Vippetangen fisketorg | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9012 | 10.7429 | 160 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| akerselva_industri | Akerselva industriområde | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9286 | 10.758 | 260 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| alnaelvstien | Alnaelvstien | natur | data/places/natur/oslo/places_oslo_alna.json | 59.931 | 10.83 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| loelva_historisk | Loelva (historisk vassdrag) | natur | data/places/natur/oslo/places_oslo_alna.json | 59.928 | 10.82 | 250 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| bjoelsenparken_elvenaer | Bjølsenparken (elvenær del) | natur | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.9386 | 10.7588 | 160 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| vaterland_historisk_elvelop | Vaterland – historisk elveløp | historie | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.9158 | 10.7332 | 180 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| eidsvolls_plass | Eidsvolls plass | politikk | data/places/politikk/oslo/places_politikk.json | 59.9157 | 10.7388 | 120 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| slottsplassen | Slottsplassen | populaerkultur | data/places/popkultur/oslo/places_oslo_populaerkultur.json | 59.9169 | 10.7276 | 200 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| daelenenga_idrettspark | Dælenenga idrettspark | sport | data/places/sport/europa/norway/oslo_sport.json | 59.9264 | 10.76449 | 170 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| nordre_aasen_idrettspark | Nordre Åsen idrettspark | sport | data/places/sport/europa/norway/oslo_sport.json | 59.942778 | 10.785 | 170 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lekeplass_sofienbergparken | Sofienbergparken lekeplass | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9229 | 10.763 | 120 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lekeplass_st_hanshaugen | St. Hanshaugen lekeplass | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9234 | 10.7463 | 120 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lekeplass_birkelunden | Birkelunden lekeplass | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9256 | 10.7574 | 110 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lekeplass_olaf_ryes_plass | Olaf Ryes plass lekeplass | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9238 | 10.7589 | 100 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lekeplass_botsparken | Botsparken lekeplass | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9053 | 10.769 | 110 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lekeplass_stensparken | Stensparken lekeplass | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9268 | 10.7406 | 110 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lekeplass_kirsebarlunden | Kirsebærlunden lekeplass | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.916 | 10.7756 | 130 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lekeplass_snippen | Snippen lekepark | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9167 | 10.7699 | 120 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lekeplass_kampen_park | Kampen park lekeplass | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9148 | 10.779 | 140 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| aktivitet_rudolf_nilsens_plass | Rudolf Nilsens plass aktivitetspark | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.916297 | 10.765853 | 130 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| treningssted_torshovdalen | Torshovdalen trenings- og aktivitetspark | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9368 | 10.777 | 220 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| treningssted_kampen_park | Kampen park treningssted | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9148 | 10.779 | 170 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| gardermoen_motorpark | Gardermoen Motorpark | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 60.1832 | 11.1399 | 280 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| selhurst_park_london | Selhurst Park | sport | data/places/sport/europa/england/footballgrounds_london.json | 51.3983 | -0.0855 | 190 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| hausmannsgate_aksen | Hausmannsgate-aksen | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9189 | 10.7513 | 240 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| schweigaards_gate_lodalen | Schweigaards gate–Lodalen veggakse | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9077 | 10.7725 | 260 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kuba_akselpassasjer | Kuba-passasjene ved Akerselva | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9236 | 10.7558 | 180 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| forskningsparken | Forskningsparken | vitenskap | data/places/vitenskap/oslo/places_vitenskap.json | 59.9426 | 10.7192 | 150 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lisbon_maat | MAAT / Tejo-kraftstasjonen | kunst | data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json | 38.6953 | -9.1937 | 200 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lisbon_terminal_de_cruzeiros | Terminal de Cruzeiros de Lisboa | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json | 38.7142 | -9.1242 | 200 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lisbon_santa_apolonia_station | Santa Apolónia Station | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json | 38.714 | -9.1228 | 180 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |

### coordStatus=verified uten coordPrecisionM (2)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| damstredet_telthusbakken | Damstredet og Telthusbakken | historie | data/places/historie/oslo/places_historie.json | 59.9236 | 10.7474 | 190 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| frysja_industriomrade | Frysja industriområde | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9608 | 10.7726 | 260 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |

### park/stort område uten anchors eller coordNote (77)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| eidsvoll_verk_andelva | Eidsvoll Verk / Andelva | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 60.3297 | 11.2575 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tertitten_urskog_holandsbanen | Tertitten / Urskog-Hølandsbanen | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 59.98628 | 11.24367 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| trandumskogen | Trandumskogen | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 60.2189 | 11.1177 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hurdal_verk_glassverk | Hurdal Verk / Hurdal Glassverk | historie | data/places/historie/akershus/places_historie_akershus_batch3.json | 60.45029 | 11.04809 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hakadal_verk | Hakadal Verk | historie | data/places/historie/akershus/places_historie_akershus_batch4.json | 60.12083 | 10.82278 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| aurskog_holand_bygdetun | Aurskog-Høland bygdetun | historie | data/places/historie/akershus/places_historie_akershus_batch5.json | 59.7194 | 11.4598 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hoytorp_fort | Høytorp fort | historie | data/places/historie/ostfold/places_historie_ostfold_batch2.json | 59.5536 | 11.3317 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tistedalen_saugbrugsforeningen | Tistedalen / Saugbrugsforeningen | historie | data/places/historie/ostfold/places_historie_ostfold_batch3.json | 59.1242 | 11.4492 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| akeroya_fort | Akerøya fort | historie | data/places/historie/ostfold/places_historie_ostfold_batch4.json | 59.0495 | 10.9136 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| veien_kulturminnepark | Veien Kulturminnepark | historie | data/places/historie/buskerud/places_historie_buskerud_batch1.json | 60.1842 | 10.2504 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| uvdal_stavkirke | Uvdal stavkirke | historie | data/places/historie/buskerud/places_historie_buskerud_batch1.json | 60.2677 | 8.5986 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hallingdal_museum_nesbyen | Hallingdal Museum Nesbyen | historie | data/places/historie/buskerud/places_historie_buskerud_batch2.json | 60.5652 | 9.1013 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| eggedal_molle | Eggedal Mølle | historie | data/places/historie/buskerud/places_historie_buskerud_batch3.json | 60.2311 | 9.3504 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| drammen_tollbod_havn | Drammen tollbod / havneområdet | historie | data/places/historie/buskerud/places_historie_buskerud_batch3.json | 59.7434 | 10.2066 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| laagdalsmuseet | Lågdalsmuseet | historie | data/places/historie/buskerud/places_historie_buskerud_batch4.json | 59.6678 | 9.6569 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| gulskogen_gard | Gulskogen gård | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 59.7336 | 10.1577 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hemsedal_bygdatun | Hemsedal Bygdatun / Øvre Løkji | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 60.8578 | 8.6409 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| lier_sykehus_historisk_omrade | Lier sykehus / historisk område | historie | data/places/historie/buskerud/places_historie_buskerud_batch6.json | 59.7867 | 10.2871 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| vikersund_stasjon_randsfjordbanen | Vikersund stasjon / Randsfjordbanen | historie | data/places/historie/buskerud/places_historie_buskerud_batch6.json | 59.9655 | 9.9986 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| norsk_skogmuseum_elverum | Norsk Skogmuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch2.json | 60.8837 | 11.5627 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| glomdalsmuseet_elverum | Glomdalsmuseet | historie | data/places/historie/innlandet/places_historie_innlandet_batch2.json | 60.8848 | 11.5558 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hundorp_dale_gudbrand | Hundorp / Dale-Gudbrands gard | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 61.5486 | 9.9427 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| folldal_gruver | Folldal gruver | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 62.1321 | 9.9973 | 480 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| raufoss_industripark_ammunisjon | Raufoss industripark / ammunisjonsfabrikken | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 60.7299 | 10.6164 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| oye_stavkirke | Øye stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch5.json | 61.1713 | 8.3996 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hedalen_stavkirke | Hedalen stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch5.json | 60.6484 | 9.7327 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| finnetunet_skogfinsk_museum | Finnetunet / skogfinsk museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.4186 | 12.4019 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| sor_fron_kirke_gudbrandsdalsdomen | Sør-Fron kirke / Gudbrandsdalsdomen | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 61.5567 | 9.9407 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| odalstunet_sor_odal | Odalstunet | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.2521 | 11.6846 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| eidskog_museum_almenninga | Eidskog museum / Almenninga | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.0347 | 12.1291 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| proysenstua_rudshogda | Prøysenstua / Rudshøgda | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 60.9127 | 10.7259 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| rendalen_bygdemuseum | Rendalen bygdemuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 61.7585 | 11.1905 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| gausdal_bygdetun | Gausdal bygdetun | historie | data/places/historie/innlandet/places_historie_innlandet_batch8.json | 61.2344 | 10.2255 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| husantunet_alvdal_bygdemuseum | Husantunet / Alvdal bygdemuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 62.1086 | 10.6311 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| koppangtunet_stor_elvdal | Koppangtunet / Stor-Elvdal museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 61.5708 | 11.0552 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tylldalen_bygdetun | Tylldalen bygdetun | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 62.1826 | 10.7551 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| nord_odal_bygdetun_sand | Nord-Odal bygdetun / Sand | historie | data/places/historie/innlandet/places_historie_innlandet_batch10.json | 60.3894 | 11.5375 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| mustad_hunnselva_gjovik | Mustad / Hunnselva industrimiljø | historie | data/places/historie/innlandet/places_historie_innlandet_batch11.json | 60.7894 | 10.6798 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| brumunddal_molle_industri | Brumunddal mølle / industrimiljø | historie | data/places/historie/innlandet/places_historie_innlandet_batch11.json | 60.8825 | 10.9394 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| etnedal_bygdetun_bruflat | Etnedal bygdetun / Bruflat | historie | data/places/historie/innlandet/places_historie_innlandet_batch11.json | 60.8887 | 9.6424 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| heidal_kirke | Heidal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch12.json | 61.7482 | 9.2701 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| espedalen_nikkelverk | Espedalen nikkelverk | historie | data/places/historie/innlandet/places_historie_innlandet_batch13.json | 61.4248 | 9.6036 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| aurdal_kirke | Aurdal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch13.json | 60.9236 | 9.4118 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| sanderud_sykehus_historisk_omrade | Sanderud sykehus / historisk område | historie | data/places/historie/innlandet/places_historie_innlandet_batch14.json | 60.7798 | 11.1805 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| otta_stasjon_gudbrandsdalen | Otta stasjon / Gudbrandsdalen | historie | data/places/historie/innlandet/places_historie_innlandet_batch14.json | 61.7712 | 9.5352 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| romedal_kirke | Romedal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch14.json | 60.7493 | 11.2508 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| snertingdal_kirke | Snertingdal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch14.json | 60.8769 | 10.4596 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| os_kirke_osterdalen | Os kirke Østerdalen | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 62.4962 | 11.2238 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| grue_finnskog_kirke | Grue Finnskog kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 60.4362 | 12.4486 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| alvdal_kirke | Alvdal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 62.1081 | 10.6302 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| oyer_kirke | Øyer kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch18.json | 61.2651 | 10.4131 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| einunna_kraftverk_folldal | Einunna kraftverk / Folldal | historie | data/places/historie/innlandet/places_historie_innlandet_batch18.json | 62.1341 | 10.0045 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| borrerhaugene_midgard | Borreparken / Borre-haugene | historie | data/places/historie/vestfold/places_historie_vestfold_batch1.json | 59.3805 | 10.4686 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hvalfangstmuseet_sandefjord | Hvalfangstmuseet Sandefjord | historie | data/places/historie/vestfold/places_historie_vestfold_batch1.json | 59.1307 | 10.2246 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| molen_brunlanes_gravroysfelt | Mølen gravrøyser | historie | data/places/historie/vestfold/places_historie_vestfold_batch2.json | 58.9696 | 9.8277 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hoyjord_stavkirke | Høyjord stavkirke | historie | data/places/historie/vestfold/places_historie_vestfold_batch3.json | 59.3047 | 10.1128 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| notteroy_kirke_faerder | Nøtterøy kirke | historie | data/places/historie/vestfold/places_historie_vestfold_batch4.json | 59.2278 | 10.4074 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| kodal_kirke_sandefjord | Kodal kirke | historie | data/places/historie/vestfold/places_historie_vestfold_batch4.json | 59.2203 | 10.1295 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| sandefjord_kurbad | Sandefjord Kurbad | historie | data/places/historie/vestfold/places_historie_vestfold_batch5.json | 59.1291 | 10.2241 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| svarstad_kirke_lardal | Svarstad kirke / Lågendalen | historie | data/places/historie/vestfold/places_historie_vestfold_batch6.json | 59.4019 | 9.9592 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| bastoy_skolehjem_horten | Bastøy skolehjem / institusjonshistorisk sted | historie | data/places/historie/vestfold/places_historie_vestfold_batch7.json | 59.3869 | 10.5318 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| sandefjord_stasjon_vestfoldbanen | Sandefjord stasjon / Vestfoldbanen | historie | data/places/historie/vestfold/places_historie_vestfold_batch7.json | 59.1317 | 10.2244 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| heddal_stavkirke | Heddal stavkirke | historie | data/places/historie/telemark/places_historie_telemark_batch1.json | 59.5794 | 9.176 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| brekkeparken_skien | Brekkeparken Skien | historie | data/places/historie/telemark/places_historie_telemark_batch1.json | 59.2072 | 9.6005 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| morgedal_norsk_skieventyr | Morgedal / Norsk Skieventyr | historie | data/places/historie/telemark/places_historie_telemark_batch3.json | 59.4776 | 8.4267 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| dalen_hotel_tokke | Dalen Hotel | historie | data/places/historie/telemark/places_historie_telemark_batch3.json | 59.4446 | 8.0081 | 340 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| fornebu_teknologipark | Fornebu Teknologipark | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.8939 | 10.6262 | 400 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| frysja_industriomrade | Frysja industriområde | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9608 | 10.7726 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| bryn_industriomrade | Bryn industriområde | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9129 | 10.8251 | 250 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| akerselva_industri | Akerselva industriområde | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9286 | 10.758 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| loelva_historisk | Loelva (historisk vassdrag) | natur | data/places/natur/oslo/places_oslo_alna.json | 59.928 | 10.82 | 250 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| furuset_haugerud_skogbelte | Furuset–Haugerud skogbelte | natur | data/places/natur/oslo/places_oslo_alna.json | 59.9345 | 10.852 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hovedoya | Hovedøya | natur | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | 59.89512 | 10.7379 | 450 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| rudskogen_motorsenter | Rudskogen Motorsenter | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 59.3759 | 11.2552 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| gardermoen_motorpark | Gardermoen Motorpark | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 60.1832 | 11.1399 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| finnskogbanen | Finnskogbanen | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 60.4513 | 12.1864 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| schweigaards_gate_lodalen | Schweigaards gate–Lodalen veggakse | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9077 | 10.7725 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |

### svært stor r (>=500 m) uten coordNote (26)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| kongsberg_solvverk | Kongsberg Sølvverk | historie | data/places/historie/buskerud/places_historie_buskerud_batch1.json | 59.6817 | 9.6267 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| blaafarvevaerket_modum | Blaafarveværket | historie | data/places/historie/buskerud/places_historie_buskerud_batch1.json | 59.9314 | 9.9202 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| maihaugen_lillehammer | Maihaugen | historie | data/places/historie/innlandet/places_historie_innlandet_batch1.json | 61.1124 | 10.4864 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| kaupang_bikjholberget | Kaupang / Bikjholberget | historie | data/places/historie/vestfold/places_historie_vestfold_batch1.json | 59.0474 | 10.0335 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| borrerhaugene_midgard | Borreparken / Borre-haugene | historie | data/places/historie/vestfold/places_historie_vestfold_batch1.json | 59.3805 | 10.4686 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| karljohansvern_horten | Karljohansvern Horten | historie | data/places/historie/vestfold/places_historie_vestfold_batch1.json | 59.4179 | 10.4891 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| molen_brunlanes_gravroysfelt | Mølen gravrøyser | historie | data/places/historie/vestfold/places_historie_vestfold_batch2.json | 58.9696 | 9.8277 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| bastoy_skolehjem_horten | Bastøy skolehjem / institusjonshistorisk sted | historie | data/places/historie/vestfold/places_historie_vestfold_batch7.json | 59.3869 | 10.5318 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| vemork_rjukan_industriarv | Vemork / Rjukan industriarv | historie | data/places/historie/telemark/places_historie_telemark_batch1.json | 59.8712 | 8.4916 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| rudskogen_motorsenter | Rudskogen Motorsenter | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 59.3759 | 11.2552 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_city | Lisboa | by | data/places/by/europe/portugal/lisbon/places_lisbon_by.json | 38.7223 | -9.1393 | 3000 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_alfama | Alfama | by | data/places/by/europe/portugal/lisbon/places_lisbon_by.json | 38.7115 | -9.13 | 500 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_ponte_25_de_abril | Ponte 25 de Abril | by | data/places/by/europe/portugal/lisbon/places_lisbon_by.json | 38.6892 | -9.1772 | 600 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_avenida_da_liberdade | Avenida da Liberdade | by | data/places/by/europe/portugal/lisbon/places_lisbon_by.json | 38.7195 | -9.1455 | 600 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_belem_bydel | Belém | by | data/places/by/europe/portugal/lisbon/places_lisbon_by.json | 38.6975 | -9.2069 | 900 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_alcantara | Alcântara | by | data/places/by/europe/portugal/lisbon/places_lisbon_by.json | 38.7062 | -9.1763 | 700 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_campo_de_ourique | Campo de Ourique | by | data/places/by/europe/portugal/lisbon/places_lisbon_by.json | 38.7196 | -9.1701 | 500 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_ajuda | Ajuda | by | data/places/by/europe/portugal/lisbon/places_lisbon_by.json | 38.7066 | -9.199 | 600 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_avenida_24_de_julho | Avenida 24 de Julho | politikk | data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json | 38.705 | -9.1556 | 600 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_parque_das_nacoes | Parque das Nações | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json | 38.7681 | -9.095 | 800 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_aeroporto_humberto_delgado_tap_headquarters | Aeroporto Humberto Delgado / TAP Headquarters | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json | 38.7742 | -9.1342 | 600 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_monsanto | Parque Florestal de Monsanto | natur | data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json | 38.7314 | -9.1828 | 1500 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_tapada_da_ajuda | Tapada da Ajuda | natur | data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json | 38.7077 | -9.19 | 1200 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_tram_28 | Tram 28 (Eléctrico 28) | populaerkultur | data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json | 38.7129 | -9.1377 | 800 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_marchas_populares | Marchas Populares de Lisboa | populaerkultur | data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json | 38.7202 | -9.1455 | 800 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_santo_antonio_festival | Santo António-festivalen i Lisboa | populaerkultur | data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json | 38.7117 | -9.1297 | 700 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |

### identisk/nesten identisk lat/lon som annet sted uten forklaring (16)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| bislett_stadion | Bislett Stadion | sport | data/places/sport/europa/norway/oslo_sport.json | 59.924722 | 10.733333 | 180 | Deler punkt med: bislett. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| slottsplassen | Slottsplassen | populaerkultur | data/places/popkultur/oslo/places_oslo_populaerkultur.json | 59.9169 | 10.7276 | 200 | Deler punkt med: slottet. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| valer_kirke_brannminne | Våler kirke / brannminne | historie | data/places/historie/innlandet/places_historie_innlandet_batch10.json | 60.6781 | 11.8337 | 300 | Deler punkt med: valer_kirke_solor. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| valer_kirke_solor | Våler kirke Solør | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 60.6781 | 11.8337 | 280 | Deler punkt med: valer_kirke_brannminne. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| good_game_redaksjon | Good Game-redaksjonen (NRK) | media | data/places/media/oslo/places_oslo_media.json | 59.9323 | 10.7182 | 80 | Deler punkt med: nrk_huset_marienlyst, nrk_marienlyst. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| nrk_huset_marienlyst | NRK-huset på Marienlyst | media | data/places/media/oslo/places_oslo_media.json | 59.9323 | 10.7182 | 180 | Deler punkt med: good_game_redaksjon, nrk_marienlyst. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| nrk_marienlyst | NRK Marienlyst | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9323 | 10.7182 | 200 | Deler punkt med: good_game_redaksjon, nrk_huset_marienlyst. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| vinmonopolet_lager | Vinmonopolets hovedlager | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9247 | 10.7524 | 160 | Deler punkt med: kuba_parken. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| lekeplass_kampen_park | Kampen park lekeplass | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9148 | 10.779 | 140 | Deler punkt med: treningssted_kampen_park. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| treningssted_kampen_park | Kampen park treningssted | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9148 | 10.779 | 170 | Deler punkt med: lekeplass_kampen_park. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| treningssted_skur13 | Skur 13 skate- og balansetrening | sport | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | 59.9066 | 10.7315 | 130 | Deler punkt med: skur13. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| bla | Blå | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9186 | 10.757 | 90 | Deler punkt med: brenneriveien_ingens_gate. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| lisbon_panteao_nacional | Panteão Nacional (Igreja de Santa Engrácia) | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json | 38.7155 | -9.1244 | 150 | Deler punkt med: lisbon_feira_da_ladra. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| lisbon_feira_da_ladra | Feira da Ladra | populaerkultur | data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json | 38.7155 | -9.1244 | 250 | Deler punkt med: lisbon_panteao_nacional. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| lisbon_cinema_sao_jorge | Cinema São Jorge | film_tv | data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json | 38.7202 | -9.1463 | 100 | Deler punkt med: lisbon_doclisboa. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| lisbon_doclisboa | Doclisboa – Festival Internacional de Cinema | film_tv | data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json | 38.7202 | -9.1463 | 250 | Deler punkt med: lisbon_cinema_sao_jorge. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |

### ligger svært langt fra de andre stedene i samme fil (159)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gamle_hvam_museum | Gamle Hvam museum | historie | data/places/historie/akershus/places_historie_akershus_batch2.json | 60.10201 | 11.38486 | 260 | Punktet ligger ~50 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hurdal_verk_glassverk | Hurdal Verk / Hurdal Glassverk | historie | data/places/historie/akershus/places_historie_akershus_batch3.json | 60.45029 | 11.04809 | 360 | Punktet ligger ~81 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| feiring_jernverk | Feiring jernverk | historie | data/places/historie/akershus/places_historie_akershus_batch5.json | 60.5194 | 11.1514 | 360 | Punktet ligger ~52 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| drobak_kirke | Drøbak kirke | historie | data/places/historie/akershus/places_historie_akershus_batch5.json | 59.66389 | 10.62949 | 220 | Punktet ligger ~51 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hvaler_kirke | Hvaler kirke | historie | data/places/historie/ostfold/places_historie_ostfold_batch2.json | 59.0375 | 11.0319 | 240 | Punktet ligger ~55 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| homlungen_fyr | Homlungen fyr | historie | data/places/historie/ostfold/places_historie_ostfold_batch6.json | 59.0331 | 11.0457 | 300 | Punktet ligger ~54 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| uvdal_stavkirke | Uvdal stavkirke | historie | data/places/historie/buskerud/places_historie_buskerud_batch1.json | 60.2677 | 8.5986 | 260 | Punktet ligger ~63 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| torpo_stavkirke | Torpo stavkirke | historie | data/places/historie/buskerud/places_historie_buskerud_batch2.json | 60.6667 | 8.7167 | 260 | Punktet ligger ~100 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hol_gamle_kyrkje | Hol gamle kyrkje | historie | data/places/historie/buskerud/places_historie_buskerud_batch2.json | 60.6158 | 8.2969 | 260 | Punktet ligger ~112 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hallingdal_museum_nesbyen | Hallingdal Museum Nesbyen | historie | data/places/historie/buskerud/places_historie_buskerud_batch2.json | 60.5652 | 9.1013 | 360 | Punktet ligger ~79 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| dagali_museum | Dagali Museum | historie | data/places/historie/buskerud/places_historie_buskerud_batch4.json | 60.415 | 8.448 | 300 | Punktet ligger ~83 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| gamle_nesbyen | Gamle Nesbyen | historie | data/places/historie/buskerud/places_historie_buskerud_batch4.json | 60.5685 | 9.1015 | 360 | Punktet ligger ~70 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| gulskogen_gard | Gulskogen gård | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 59.7336 | 10.1577 | 320 | Punktet ligger ~59 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| aal_bygdamuseum | Ål Bygdamuseum | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 60.6359 | 8.5627 | 320 | Punktet ligger ~75 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| gol_bygdemuseum | Gol Bygdemuseum | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 60.7012 | 8.9653 | 320 | Punktet ligger ~68 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hemsedal_bygdatun | Hemsedal Bygdatun / Øvre Løkji | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 60.8578 | 8.6409 | 320 | Punktet ligger ~92 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bragernes_kirke | Bragernes kirke | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 59.7463 | 10.2051 | 260 | Punktet ligger ~60 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| nore_i_kraftverk | Nore I kraftverk | historie | data/places/historie/buskerud/places_historie_buskerud_batch6.json | 60.2674 | 8.9466 | 420 | Punktet ligger ~73 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| ringebu_stavkirke | Ringebu stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch1.json | 61.5293 | 10.1417 | 300 | Punktet ligger ~71 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| lom_stavkirke | Lom stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch1.json | 61.8372 | 8.5686 | 300 | Punktet ligger ~152 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kongsvinger_festning | Kongsvinger festning | historie | data/places/historie/innlandet/places_historie_innlandet_batch1.json | 60.1934 | 12.0039 | 420 | Punktet ligger ~110 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hegge_stavkirke | Hegge stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch2.json | 61.1235 | 9.0774 | 280 | Punktet ligger ~92 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| reinli_stavkirke | Reinli stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch2.json | 60.8377 | 9.4888 | 280 | Punktet ligger ~65 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| norsk_utvandrermuseum_ottestad | Norsk utvandrermuseum Ottestad | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 60.7731 | 11.1197 | 360 | Punktet ligger ~130 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| raufoss_industripark_ammunisjon | Raufoss industripark / ammunisjonsfabrikken | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 60.7299 | 10.6164 | 420 | Punktet ligger ~126 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| lesja_bygdemuseum | Lesja bygdemuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 62.1171 | 8.8618 | 320 | Punktet ligger ~72 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kvikne_kobberverk | Kvikne kobberverk | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 62.5756 | 10.2155 | 380 | Punktet ligger ~83 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bagnsbergatn_krigsminne | Bagnsbergatn / krigsminne | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 60.8227 | 9.5492 | 360 | Punktet ligger ~116 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| tolga_os_museum | Tolga-Os museum / Dølmotunet | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 62.4083 | 10.9986 | 320 | Punktet ligger ~79 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| norsk_vegmuseum_oyer | Norsk vegmuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch4.json | 61.2234 | 10.4368 | 420 | Punktet ligger ~67 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| nybergsund_kongens_nei | Nybergsund / Kongens nei | historie | data/places/historie/innlandet/places_historie_innlandet_batch4.json | 61.2601 | 12.3266 | 360 | Punktet ligger ~95 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kvinnemuseet_kongsvinger | Kvinnemuseet Kongsvinger | historie | data/places/historie/innlandet/places_historie_innlandet_batch4.json | 60.1916 | 12.0061 | 280 | Punktet ligger ~78 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| lomen_stavkirke | Lomen stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch5.json | 61.1242 | 8.8924 | 280 | Punktet ligger ~51 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| oye_stavkirke | Øye stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch5.json | 61.1713 | 8.3996 | 280 | Punktet ligger ~78 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hedalen_stavkirke | Hedalen stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch5.json | 60.6484 | 9.7327 | 300 | Punktet ligger ~53 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| vaga_kyrkje | Vågå kyrkje | historie | data/places/historie/innlandet/places_historie_innlandet_batch5.json | 61.8751 | 9.0966 | 280 | Punktet ligger ~93 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| matrand_slagsted_1814 | Matrand / slagsted 1814 | historie | data/places/historie/innlandet/places_historie_innlandet_batch5.json | 60.0342 | 12.1298 | 420 | Punktet ligger ~173 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| magnor_glassverk | Magnor Glassverk | historie | data/places/historie/innlandet/places_historie_innlandet_batch5.json | 59.9506 | 12.2024 | 320 | Punktet ligger ~183 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| finnetunet_skogfinsk_museum | Finnetunet / skogfinsk museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.4186 | 12.4019 | 360 | Punktet ligger ~96 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| sor_fron_kirke_gudbrandsdalsdomen | Sør-Fron kirke / Gudbrandsdalsdomen | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 61.5567 | 9.9407 | 300 | Punktet ligger ~91 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| lesja_kirke | Lesja kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 62.1176 | 8.8613 | 280 | Punktet ligger ~175 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| valdres_folkemuseum_fagernes | Valdres Folkemuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.9869 | 9.2356 | 420 | Punktet ligger ~92 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| odalstunet_sor_odal | Odalstunet | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.2521 | 11.6846 | 320 | Punktet ligger ~82 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| tynset_bygdemuseum | Tynset bygdemuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 62.2764 | 10.7821 | 320 | Punktet ligger ~154 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| eidskog_museum_almenninga | Eidskog museum / Almenninga | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.0347 | 12.1291 | 320 | Punktet ligger ~116 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| ringsaker_kirke | Ringsaker kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 60.8839 | 10.9486 | 280 | Punktet ligger ~99 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| proysenstua_rudshogda | Prøysenstua / Rudshøgda | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 60.9127 | 10.7259 | 280 | Punktet ligger ~95 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| dovre_kirke | Dovre kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 61.9858 | 9.2509 | 280 | Punktet ligger ~79 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| sel_kirke_otta | Sel kirke / Otta-landskapet | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 61.7719 | 9.5366 | 280 | Punktet ligger ~60 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| femundshytten_smeltverk | Femundshytten / smeltehyttehistorie | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 62.2235 | 11.9254 | 420 | Punktet ligger ~83 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| skjaak_bygdamuseum | Skjåk bygdamuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 61.8837 | 8.2668 | 320 | Punktet ligger ~127 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| stenberg_toten_museum | Stenberg / Toten museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 60.6818 | 10.6289 | 340 | Punktet ligger ~120 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| nordberg_fort | Nordberg fort | historie | data/places/historie/innlandet/places_historie_innlandet_batch8.json | 61.8959 | 8.2276 | 360 | Punktet ligger ~138 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| trysil_bygdetun | Trysil bygdetun | historie | data/places/historie/innlandet/places_historie_innlandet_batch8.json | 61.3092 | 12.2566 | 320 | Punktet ligger ~98 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| solor_museum_flisa | Solør museum / Flisa | historie | data/places/historie/innlandet/places_historie_innlandet_batch8.json | 60.6098 | 12.0118 | 320 | Punktet ligger ~110 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| grue_kirke_brannminne | Grue kirke / brannminne | historie | data/places/historie/innlandet/places_historie_innlandet_batch8.json | 60.4511 | 12.0639 | 300 | Punktet ligger ~124 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| lom_bygdamuseum_presthaugen | Lom bygdamuseum / Presthaugen | historie | data/places/historie/innlandet/places_historie_innlandet_batch8.json | 61.8376 | 8.5714 | 320 | Punktet ligger ~119 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| blokkodden_villmarksmuseum | Blokkodden Villmarksmuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 61.9694 | 11.9558 | 360 | Punktet ligger ~94 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| husantunet_alvdal_bygdemuseum | Husantunet / Alvdal bygdemuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 62.1086 | 10.6311 | 320 | Punktet ligger ~82 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| tylldalen_bygdetun | Tylldalen bygdetun | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 62.1826 | 10.7551 | 300 | Punktet ligger ~90 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| vang_kirke_hamar | Vang kirke Hamar | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 60.8257 | 11.1325 | 280 | Punktet ligger ~65 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kistefos_tresliperi_jevnaker | Kistefos tresliperi / industrimuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch10.json | 60.2246 | 10.3716 | 380 | Punktet ligger ~61 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| vang_stavkirke_tomta_valdres | Vang stavkirke / opprinnelig kirkested | historie | data/places/historie/innlandet/places_historie_innlandet_batch10.json | 61.1256 | 8.5719 | 300 | Punktet ligger ~132 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| nord_odal_bygdetun_sand | Nord-Odal bygdetun / Sand | historie | data/places/historie/innlandet/places_historie_innlandet_batch10.json | 60.3894 | 11.5375 | 320 | Punktet ligger ~52 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| valer_kirke_brannminne | Våler kirke / brannminne | historie | data/places/historie/innlandet/places_historie_innlandet_batch10.json | 60.6781 | 11.8337 | 300 | Punktet ligger ~53 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bagn_bygdesamling | Bagn Bygdesamling | historie | data/places/historie/innlandet/places_historie_innlandet_batch11.json | 60.8229 | 9.5528 | 320 | Punktet ligger ~57 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| etnedal_bygdetun_bruflat | Etnedal bygdetun / Bruflat | historie | data/places/historie/innlandet/places_historie_innlandet_batch11.json | 60.8887 | 9.6424 | 320 | Punktet ligger ~53 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| brandval_kirke | Brandval kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch11.json | 60.3157 | 12.0144 | 280 | Punktet ligger ~94 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hjerkinn_fjellstue | Hjerkinn fjellstue | historie | data/places/historie/innlandet/places_historie_innlandet_batch12.json | 62.2217 | 9.5554 | 360 | Punktet ligger ~84 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| budsjord_pilegrimsgard | Budsjord pilegrimsgård | historie | data/places/historie/innlandet/places_historie_innlandet_batch12.json | 62.0539 | 9.1208 | 320 | Punktet ligger ~76 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| jutulheimen_vagaa_bygdamuseum | Jutulheimen / Vågå bygdamuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch12.json | 61.8758 | 9.0957 | 320 | Punktet ligger ~62 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hoff_kirke_toten | Hoff kirke Østre Toten | historie | data/places/historie/innlandet/places_historie_innlandet_batch12.json | 60.6733 | 10.8187 | 280 | Punktet ligger ~102 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| gjovik_glassverk_historisk_miljo | Gjøvik glassverk / historisk miljø | historie | data/places/historie/innlandet/places_historie_innlandet_batch12.json | 60.7937 | 10.6916 | 300 | Punktet ligger ~87 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| eina_stasjon_totenbanen | Eina stasjon / Totenbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch12.json | 60.6286 | 10.5988 | 300 | Punktet ligger ~102 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| nes_kirke_ringsaker | Nes kirke Ringsaker | historie | data/places/historie/innlandet/places_historie_innlandet_batch13.json | 60.7648 | 10.9427 | 280 | Punktet ligger ~69 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| ullinsvin_vagaa_prestegard | Ullinsvin / Vågå prestegard | historie | data/places/historie/innlandet/places_historie_innlandet_batch13.json | 61.8755 | 9.0951 | 300 | Punktet ligger ~94 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| dombas_stasjon_jernbaneknutepunkt | Dombås stasjon / jernbaneknutepunkt | historie | data/places/historie/innlandet/places_historie_innlandet_batch14.json | 62.0697 | 9.1239 | 320 | Punktet ligger ~159 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| otta_stasjon_gudbrandsdalen | Otta stasjon / Gudbrandsdalen | historie | data/places/historie/innlandet/places_historie_innlandet_batch14.json | 61.7712 | 9.5352 | 300 | Punktet ligger ~119 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kongsvinger_stasjon_grensebanen | Kongsvinger stasjon / grensebanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch14.json | 60.1907 | 12.0007 | 300 | Punktet ligger ~101 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| tynset_stasjon_rorosbanen | Tynset stasjon / Rørosbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 62.2757 | 10.7828 | 300 | Punktet ligger ~116 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kvam_krigsminne_1940 | Kvam / krigsminne 1940 | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 61.6655 | 9.6904 | 360 | Punktet ligger ~100 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| asnes_kirke | Åsnes kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 60.6134 | 12.0112 | 280 | Punktet ligger ~81 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hof_kirke_asnes | Hof kirke Åsnes | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 60.5402 | 12.0804 | 280 | Punktet ligger ~90 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| tolga_kirke | Tolga kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 62.4091 | 10.9996 | 280 | Punktet ligger ~128 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| os_kirke_osterdalen | Os kirke Østerdalen | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 62.4962 | 11.2238 | 280 | Punktet ligger ~136 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| valer_kirke_solor | Våler kirke Solør | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 60.6781 | 11.8337 | 280 | Punktet ligger ~70 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| skarnes_stasjon_kongsvingerbanen | Skarnes stasjon / Kongsvingerbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch16.json | 60.2536 | 11.6819 | 300 | Punktet ligger ~71 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| braskereidfoss_kraftverk | Braskereidfoss kraftverk | historie | data/places/historie/innlandet/places_historie_innlandet_batch16.json | 60.7219 | 11.8042 | 360 | Punktet ligger ~57 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| slidredomen_vestre_slidre | Slidredomen / Vestre Slidre kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 61.0887 | 8.9815 | 300 | Punktet ligger ~114 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bruflat_kirke_etnedal | Bruflat kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 60.8878 | 9.6428 | 280 | Punktet ligger ~74 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| flisa_stasjon_solorbanen | Flisa stasjon / Solørbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 60.6095 | 12.0116 | 300 | Punktet ligger ~58 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| vinger_kirke_kongsvinger | Vinger kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 60.1905 | 12.0042 | 280 | Punktet ligger ~83 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| grue_finnskog_kirke | Grue Finnskog kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 60.4362 | 12.4486 | 280 | Punktet ligger ~87 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| alvdal_kirke | Alvdal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 62.1081 | 10.6302 | 280 | Punktet ligger ~153 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bjorgan_prestegard_kvikne | Bjørgan prestegård Kvikne | historie | data/places/historie/innlandet/places_historie_innlandet_batch18.json | 62.5728 | 10.2179 | 300 | Punktet ligger ~52 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kvikne_kirke | Kvikne kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch18.json | 62.5764 | 10.2184 | 280 | Punktet ligger ~53 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| oyer_kirke | Øyer kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch18.json | 61.2651 | 10.4131 | 280 | Punktet ligger ~94 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| tretten_kirke | Tretten kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch18.json | 61.3158 | 10.3012 | 280 | Punktet ligger ~88 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| ringebu_prestegard | Ringebu prestegard | historie | data/places/historie/innlandet/places_historie_innlandet_batch18.json | 61.5292 | 10.1501 | 300 | Punktet ligger ~64 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| dombas_krigsminne_1940 | Dombås / krigsminne 1940 | historie | data/places/historie/innlandet/places_historie_innlandet_batch18.json | 62.0694 | 9.1242 | 360 | Punktet ligger ~57 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| os_stasjon_rorosbanen | Os stasjon / Rørosbanen | historie | data/places/historie/innlandet/places_historie_innlandet_batch18.json | 62.4957 | 11.2235 | 300 | Punktet ligger ~68 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| vemork_rjukan_industriarv | Vemork / Rjukan industriarv | historie | data/places/historie/telemark/places_historie_telemark_batch1.json | 59.8712 | 8.4916 | 520 | Punktet ligger ~69 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| eidsborg_stavkirke | Eidsborg stavkirke | historie | data/places/historie/telemark/places_historie_telemark_batch1.json | 59.4648 | 8.0244 | 320 | Punktet ligger ~69 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| rjukanbanen_rjukan_stasjon | Rjukanbanen / Rjukan stasjon | historie | data/places/historie/telemark/places_historie_telemark_batch2.json | 59.8789 | 8.5927 | 360 | Punktet ligger ~59 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| vest_telemark_museum_eidsborg | Vest-Telemark Museum Eidsborg | historie | data/places/historie/telemark/places_historie_telemark_batch3.json | 59.4656 | 8.0233 | 360 | Punktet ligger ~78 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| morgedal_norsk_skieventyr | Morgedal / Norsk Skieventyr | historie | data/places/historie/telemark/places_historie_telemark_batch3.json | 59.4776 | 8.4267 | 420 | Punktet ligger ~58 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| dalen_hotel_tokke | Dalen Hotel | historie | data/places/historie/telemark/places_historie_telemark_batch3.json | 59.4446 | 8.0081 | 340 | Punktet ligger ~78 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hafrsfjord | Hafrsfjord | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | 58.9414 | 5.6713 | 450 | Punktet ligger ~172 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| avaldsnes_kongsgard | Avaldsnes kongsgård | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | 59.35458 | 5.29262 | 180 | Punktet ligger ~160 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| stiklestad | Stiklestad | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | 63.7956 | 11.559 | 220 | Punktet ligger ~460 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| nidarosdomen | Nidarosdomen | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | 63.4269 | 10.3969 | 80 | Punktet ligger ~400 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| lade_gard | Lade gård / Lade | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | 63.44696 | 10.44089 | 170 | Punktet ligger ~402 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bergenhus_haakonshallen | Bergenhus / Håkonshallen | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | 60.3997 | 5.3175 | 100 | Punktet ligger ~142 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| tonsberg_slottsfjell | Slottsfjellet i Tønsberg | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | 59.27196 | 10.40392 | 160 | Punktet ligger ~170 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| moster_gamle_kyrkje | Moster gamle kyrkje | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | 59.70133 | 5.38115 | 120 | Punktet ligger ~140 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| sola_erling_skjalgsson | Sola / Erling Skjalgssons maktlandskap | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | 58.89099 | 5.61132 | 200 | Punktet ligger ~178 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| reinskloster | Rein kloster | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | 63.5648 | 9.92188 | 180 | Punktet ligger ~406 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| stein_ringerike_halvdanshaugen | Stein på Ringerike / Halvdanshaugen | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 60.10125 | 10.29613 | 260 | Punktet ligger ~241 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| fitjar_hakonarparken | Håkonarparken på Fitjar | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 59.91731 | 5.31801 | 160 | Punktet ligger ~128 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| gulatinget_flolid | Gulatinget på Flolid | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 60.96923 | 5.12364 | 220 | Punktet ligger ~61 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hjorungavag | Hjørungavåg | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 62.3426 | 6.0725 | 420 | Punktet ligger ~153 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| rimol_melhus | Rimol i Melhus | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 63.2869 | 10.2707 | 200 | Punktet ligger ~331 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bjarkoy_tore_hund | Tore Hunds naust og monument på Bjarkøy | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 68.99776 | 16.53797 | 220 | Punktet ligger ~1012 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| egge_gard_steinkjer | Egge gård og Egge museum | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 64.021678 | 11.463289 | 260 | Punktet ligger ~432 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| giske_kyrkje | Giske kyrkje og Giskeætta | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 62.49864 | 6.05026 | 170 | Punktet ligger ~170 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hallvardskirken_oslo | Hallvardskirken i middelalder-Oslo | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 59.9065 | 10.7644 | 90 | Punktet ligger ~274 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| munkeliv_kloster | Munkeliv kloster på Nordnes | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 60.39502 | 5.31554 | 100 | Punktet ligger ~82 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| nordnes_bergen | Nordnes i Bergen | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 60.39925 | 5.30654 | 260 | Punktet ligger ~82 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| audunborg_hegrenes | Audunborg på Hegrenes | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 61.5008 | 6.2582 | 220 | Punktet ligger ~59 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| varteig_kirke | Varteig kirke og Inga fra Varteig-landskapet | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 59.35034 | 11.18966 | 220 | Punktet ligger ~327 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| elgeseter_kloster | Elgeseter kloster i Klostergata | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 63.42111 | 10.39401 | 180 | Punktet ligger ~347 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| talgje_kyrkje | Talgje kyrkje og Talgje-godset | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 59.10627 | 5.84153 | 170 | Punktet ligger ~208 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| nidaros_erkebispegarden | Erkebispegården i Nidaros | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 63.42683 | 10.39596 | 110 | Punktet ligger ~295 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kristkirken_bergenhus | Kristkirken på Bergenhus | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 60.40042 | 5.31827 | 90 | Punktet ligger ~276 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hakonshella_bauta | Håkonshella og Håkon den gode-bautaen | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 60.34567 | 5.18007 | 230 | Punktet ligger ~284 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| frostatinget_logtun | Frostatinget på Logtun | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 63.5675 | 10.7027 | 180 | Punktet ligger ~311 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kalvskinnet_slagsted | Kalvskinnet slagsted | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 63.4292 | 10.3873 | 260 | Punktet ligger ~295 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| fimreite_slagsted | Fimreite slagsted | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 61.1546 | 6.9884 | 520 | Punktet ligger ~184 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| sekken_slagsted | Sekken slagsted og minnestein | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 62.647 | 7.3678 | 320 | Punktet ligger ~259 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| re_slagsted_ramnes | Re slagsted ved Ramnes | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 59.3501 | 10.2369 | 300 | Punktet ligger ~159 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bratsberg_gard | Bratsberg gård | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 59.1742 | 9.6602 | 180 | Punktet ligger ~182 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| vagar_lofoten_storvagan | Vågar i Storvågan/Kabelvåg | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 68.2145 | 14.4759 | 260 | Punktet ligger ~850 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bohus_festning_bagaholmen | Bohus festning på Bagaholmen | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 57.8628 | 11.9987 | 180 | Punktet ligger ~338 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kalmar_slott | Kalmar slott | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 56.6616 | 16.3568 | 180 | Punktet ligger ~575 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| york_jorvik | Jórvík / York | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 53.95761 | -1.07999 | 300 | Punktet ligger ~121 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| downpatrick_magnus_berrfott | Downpatrick og Magnus Berrføtt | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 54.3278 | -5.7159 | 400 | Punktet ligger ~314 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| holmengra_hvaler | Holmengrå ved Hvaler | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 59.027 | 11.045 | 650 | Punktet ligger ~851 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| stamford_bridge_battlefield | Stamford Bridge battlefield | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 53.989 | -0.903 | 650 | Punktet ligger ~117 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| jelling_kongsgard | Jelling kongsgård og monumentområde | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 55.756 | 9.419 | 320 | Punktet ligger ~661 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| orkney_birsay | Brough of Birsay / Orknøyene | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 59.136 | -3.322 | 420 | Punktet ligger ~476 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| proysenhuset_rudshogda | Prøysenhuset – Rudshøgda | litteratur | data/places/litteratur/oslo/places_litteratur.json | 60.8827 | 10.9502 | 160 | Punktet ligger ~108 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| valerbanen | Vålerbanen | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 60.7094 | 11.9052 | 420 | Punktet ligger ~119 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| gardermoen_raceway | Gardermoen Raceway | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 60.1795 | 11.1378 | 320 | Punktet ligger ~52 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| gardermoen_motorpark | Gardermoen Motorpark | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 60.1832 | 11.1399 | 280 | Punktet ligger ~52 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| grenland_motorsportsenter | Grenland Motorsportsenter | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 59.1319 | 9.6416 | 330 | Punktet ligger ~106 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| naf_gokartsenter_andebu | NAF Gokartsenter Andebu (Håsken) | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 59.3407 | 10.1873 | 180 | Punktet ligger ~68 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kongsberg_motorsenter | Kongsberg Motorsenter | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 59.7117 | 9.6101 | 280 | Punktet ligger ~86 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| finnskogbanen | Finnskogbanen | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 60.4513 | 12.1864 | 260 | Punktet ligger ~101 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| tvergastein | Tvergastein | vitenskap | data/places/vitenskap/oslo/places_vitenskap.json | 60.5322 | 8.1824 | 400 | Punktet ligger ~156 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |

## Anbefalt kommando
- `node tools/place-coordinate-quality-gate.mjs`
