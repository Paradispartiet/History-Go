# Place coordinate quality gate

Generert: 2026-06-15T14:00:39.811Z

## Oppsummering
- Aktive filer validert: **47**
- Antall steder validert: **548**
- Harde feil: **0**
- Varsler: **150**
- Coordinate review candidates: **227** signaler fordelt på **174** steder

Nivåene betyr:
- **Harde feil**: formelle koordinatfeil (ugyldig/manglende lat/lon/r, ødelagte anchors, manglende filer). Disse stopper gaten.
- **Varsler**: sannsynlige posisjonsrisikoer basert på enkle heuristikker.
- **Coordinate review candidates**: steder der repo-data alene ikke gir grunn til å stole på punktet. Signalene beviser ikke at posisjonen er feil – de peker ut kandidater for manuell kartkontroll.

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

Totalt 227 signaler fordelt på 174 steder. Et sted kan ha flere signaler. Kandidatene under er gruppert etter grunn.

### Antall per grunn

| Grunn | Antall |
| --- | --- |
| lav koordinatpresisjon (<4 desimaler) | 86 |
| lineært sted uten anchors | 34 |
| stasjon/park/gate/torg/elv uten coordinate metadata | 43 |
| coordStatus=verified uten coordPrecisionM | 2 |
| park/stort område uten anchors eller coordNote | 17 |
| svært stor r (>=500 m) uten coordNote | 17 |
| identisk/nesten identisk lat/lon som annet sted uten forklaring | 14 |
| ligger svært langt fra de andre stedene i samme fil | 14 |

### lav koordinatpresisjon (<4 desimaler) (86)

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

### lineært sted uten anchors (34)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ring_3 | Ring 3 | by | data/places/by/oslo/places_by.json | 59.931 | 10.792 | 400 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| christiania_torv | Christiania Torv | by | data/places/by/oslo/places_by.json | 59.9104 | 10.7397 | 150 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| prinds_christian_augusts_minde | Prinds Christian Augusts Minde | historie | data/places/historie/oslo/places_historie_added_batch_01.json | 59.915289 | 10.75595 | 120 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| eidsvoll_verk_andelva | Eidsvoll Verk / Andelva | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 60.3297 | 11.2575 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
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

### stasjon/park/gate/torg/elv uten coordinate metadata (43)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| middelalder_oslo | Middelalderparken | historie | data/places/historie/oslo/places_historie.json | 59.9048 | 10.7605 | 180 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| nostvet_boplass | Nøstvet-boplassen | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 59.75109 | 10.7996 | 220 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| eidsvoll_verk_andelva | Eidsvoll Verk / Andelva | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 60.3297 | 11.2575 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kjeller_flyplass | Kjeller flyplass | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 59.96944 | 11.03889 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| stunner_boplass | Stunner steinalderboplass | historie | data/places/historie/akershus/places_historie_akershus_batch3.json | 59.74657 | 10.91747 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
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

### park/stort område uten anchors eller coordNote (17)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| eidsvoll_verk_andelva | Eidsvoll Verk / Andelva | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 60.3297 | 11.2575 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tertitten_urskog_holandsbanen | Tertitten / Urskog-Hølandsbanen | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 59.98628 | 11.24367 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| trandumskogen | Trandumskogen | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 60.2189 | 11.1177 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hurdal_verk_glassverk | Hurdal Verk / Hurdal Glassverk | historie | data/places/historie/akershus/places_historie_akershus_batch3.json | 60.45029 | 11.04809 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hakadal_verk | Hakadal Verk | historie | data/places/historie/akershus/places_historie_akershus_batch4.json | 60.12083 | 10.82278 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| aurskog_holand_bygdetun | Aurskog-Høland bygdetun | historie | data/places/historie/akershus/places_historie_akershus_batch5.json | 59.7194 | 11.4598 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
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

### svært stor r (>=500 m) uten coordNote (17)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
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

### identisk/nesten identisk lat/lon som annet sted uten forklaring (14)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| bislett_stadion | Bislett Stadion | sport | data/places/sport/europa/norway/oslo_sport.json | 59.924722 | 10.733333 | 180 | Deler punkt med: bislett. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| slottsplassen | Slottsplassen | populaerkultur | data/places/popkultur/oslo/places_oslo_populaerkultur.json | 59.9169 | 10.7276 | 200 | Deler punkt med: slottet. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
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

### ligger svært langt fra de andre stedene i samme fil (14)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| eidsvollsbygningen | Eidsvollsbygningen | historie | data/places/historie/oslo/places_historie.json | 60.3304 | 11.2617 | 250 | Punktet ligger ~54 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| gamle_hvam_museum | Gamle Hvam museum | historie | data/places/historie/akershus/places_historie_akershus_batch2.json | 60.10201 | 11.38486 | 260 | Punktet ligger ~50 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hurdal_verk_glassverk | Hurdal Verk / Hurdal Glassverk | historie | data/places/historie/akershus/places_historie_akershus_batch3.json | 60.45029 | 11.04809 | 360 | Punktet ligger ~81 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| feiring_jernverk | Feiring jernverk | historie | data/places/historie/akershus/places_historie_akershus_batch5.json | 60.5194 | 11.1514 | 360 | Punktet ligger ~52 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| drobak_kirke | Drøbak kirke | historie | data/places/historie/akershus/places_historie_akershus_batch5.json | 59.66389 | 10.62949 | 220 | Punktet ligger ~51 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
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
