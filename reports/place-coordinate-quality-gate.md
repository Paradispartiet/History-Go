# Place coordinate quality gate

Generert: 2026-07-23T04:12:56.619Z

## Oppsummering
- Aktive filer validert: **628**
- Antall steder validert: **1245**
- Harde feil: **0**
- Varsler: **478**
- Coordinate review candidates: **744** signaler fordelt på **615** steder

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
- data/places/by/oslo/oslo_domkirke.json
- data/places/by/oslo/damstredet_telthusbakken.json
- data/places/by/oslo/gamle_trikkestallen.json
- data/places/politikk/oslo/slottet.json
- data/places/by/oslo/sofienberg_kirke.json
- data/places/by/oslo/trefoldighetskirken.json
- data/places/historie/oslo/places_historie_added_batch_01.json
- data/places/by/oslo/gamle_radhus.json
- data/places/historie/akershus/places_historie_akershus_batch1.json
- data/places/historie/akershus/grini_fangeleir.json
- data/places/naeringsliv/akershus/baerums_verk_jernverk.json
- data/places/politikk/akershus/eidsvollsbygningen.json
- data/places/naeringsliv/akershus/eidsvoll_verk_andelva.json
- data/places/by/akershus/tertitten_urskog_holandsbanen.json
- data/places/by/akershus/kjeller_flyplass.json
- data/places/historie/akershus/places_historie_akershus_batch2.json
- data/places/by/akershus/hvitsten_sjobodene.json
- data/places/historie/akershus/places_historie_akershus_batch3.json
- data/places/by/akershus/son_ladested.json
- data/places/by/akershus/holen_ladested.json
- data/places/naeringsliv/akershus/hurdal_verk_glassverk.json
- data/places/historie/akershus/places_historie_akershus_batch4.json
- data/places/naeringsliv/akershus/hadeland_glassverk.json
- data/places/naeringsliv/akershus/kistefos_traesliperi.json
- data/places/naeringsliv/akershus/hakadal_verk.json
- data/places/historie/akershus/places_historie_akershus_batch5.json
- data/places/naeringsliv/akershus/feiring_jernverk.json
- data/places/by/akershus/drobak_kirke.json
- data/places/historie/ostfold/places_historie_ostfold_batch1.json
- data/places/politikk/ostfold/moss_jernverk_konventionsgarden.json
- data/places/historie/ostfold/places_historie_ostfold_batch2.json
- data/places/by/ostfold/orje_sluser_haldenkanalen.json
- data/places/naeringsliv/ostfold/askim_gummivarefabrikk.json
- data/places/historie/ostfold/places_historie_ostfold_batch3.json
- data/places/naeringsliv/ostfold/borregaard_sarpsborg_industri.json
- data/places/natur/ostfold/sarpsfossen.json
- data/places/politikk/ostfold/spydeberg_prestegard_1814.json
- data/places/naeringsliv/ostfold/tistedalen_saugbrugsforeningen.json
- data/places/historie/ostfold/places_historie_ostfold_batch4.json
- data/places/scenekunst/ostfold/fredrikshalds_teater.json
- data/places/by/ostfold/kornsjo_grensestasjon.json
- data/places/historie/ostfold/places_historie_ostfold_batch5.json
- data/places/by/ostfold/brekke_sluser_haldenkanalen.json
- data/places/by/ostfold/stromsfoss_sluser.json
- data/places/naeringsliv/ostfold/moss_mollebyen_industri.json
- data/places/historie/ostfold/places_historie_ostfold_batch6.json
- data/places/by/ostfold/homlungen_fyr.json
- data/places/historie/buskerud/places_historie_buskerud_batch1.json
- data/places/naeringsliv/buskerud/kongsberg_solvverk.json
- data/places/naeringsliv/buskerud/blaafarvevaerket_modum.json
- data/places/historie/buskerud/places_historie_buskerud_batch2.json
- data/places/by/buskerud/kroderbanen_kroderen_stasjon.json
- data/places/naeringsliv/buskerud/nostetangen_glassverk.json
- data/places/historie/buskerud/places_historie_buskerud_batch3.json
- data/places/naeringsliv/buskerud/labro_museum.json
- data/places/litteratur/buskerud/portaasen_wildenvey.json
- data/places/naeringsliv/buskerud/eggedal_molle.json
- data/places/by/buskerud/drammen_tollbod_havn.json
- data/places/historie/buskerud/places_historie_buskerud_batch4.json
- data/places/naeringsliv/buskerud/kjerraten_i_asa.json
- data/places/naeringsliv/buskerud/hassel_jernverk.json
- data/places/vitenskap/buskerud/bergseminaret_kongsberg.json
- data/places/by/buskerud/gamle_nesbyen.json
- data/places/historie/buskerud/places_historie_buskerud_batch5.json
- data/places/kunst/buskerud/lauvlia_kittelsen.json
- data/places/kunst/buskerud/hagan_skredsvig.json
- data/places/historie/buskerud/places_historie_buskerud_batch6.json
- data/places/by/buskerud/riddergarden_honefoss.json
- data/places/naeringsliv/buskerud/nore_i_kraftverk.json
- data/places/naeringsliv/buskerud/sundvollen_hotell_skysskifte.json
- data/places/naeringsliv/buskerud/union_papirfabrikk_drammen.json
- data/places/naeringsliv/buskerud/solberg_spinderi.json
- data/places/by/buskerud/vikersund_stasjon_randsfjordbanen.json
- data/places/historie/innlandet/places_historie_innlandet_batch1.json
- data/places/litteratur/innlandet/aulestad_bjornson.json
- data/places/naeringsliv/innlandet/klevfos_cellulose.json
- data/places/naeringsliv/innlandet/atlungstad_brenneri.json
- data/places/historie/innlandet/places_historie_innlandet_batch2.json
- data/places/by/innlandet/skibladner_gjovik.json
- data/places/litteratur/innlandet/bjerkebaek_undset.json
- data/places/historie/innlandet/places_historie_innlandet_batch3.json
- data/places/naeringsliv/innlandet/folldal_gruver.json
- data/places/naeringsliv/innlandet/raufoss_industripark_ammunisjon.json
- data/places/naeringsliv/innlandet/kvikne_kobberverk.json
- data/places/historie/innlandet/places_historie_innlandet_batch4.json
- data/places/politikk/innlandet/elverum_folkehogskole_1940.json
- data/places/historie/innlandet/places_historie_innlandet_batch5.json
- data/places/naeringsliv/innlandet/magnor_glassverk.json
- data/places/historie/innlandet/places_historie_innlandet_batch6.json
- data/places/by/innlandet/hamar_stasjon_jernbanebyen.json
- data/places/historie/innlandet/places_historie_innlandet_batch7.json
- data/places/litteratur/innlandet/proysenstua_rudshogda.json
- data/places/litteratur/innlandet/proysenhuset_rudshogda.json
- data/places/naeringsliv/innlandet/femundshytten_smeltverk.json
- data/places/historie/innlandet/places_historie_innlandet_batch8.json
- data/places/historie/innlandet/places_historie_innlandet_batch9.json
- data/places/naeringsliv/innlandet/mesna_kraft_og_industri.json
- data/places/naeringsliv/innlandet/lillehammer_bryggeri_historisk_miljo.json
- data/places/historie/innlandet/places_historie_innlandet_batch10.json
- data/places/naeringsliv/innlandet/kistefos_tresliperi_jevnaker.json
- data/places/naeringsliv/innlandet/kapp_melkefabrikk.json
- data/places/naeringsliv/innlandet/loiten_braenderi.json
- data/places/historie/innlandet/places_historie_innlandet_batch11.json
- data/places/naeringsliv/innlandet/mustad_hunnselva_gjovik.json
- data/places/naeringsliv/innlandet/brumunddal_molle_industri.json
- data/places/historie/innlandet/places_historie_innlandet_batch12.json
- data/places/naeringsliv/innlandet/gjovik_glassverk_historisk_miljo.json
- data/places/by/innlandet/eina_stasjon_totenbanen.json
- data/places/historie/innlandet/places_historie_innlandet_batch13.json
- data/places/naeringsliv/innlandet/espedalen_nikkelverk.json
- data/places/by/innlandet/fagernes_stasjon_valdresbanen.json
- data/places/by/innlandet/lillehammer_stasjon.json
- data/places/historie/innlandet/places_historie_innlandet_batch14.json
- data/places/by/innlandet/dombas_stasjon_jernbaneknutepunkt.json
- data/places/naeringsliv/innlandet/biri_glassverk_historisk_sted.json
- data/places/by/innlandet/otta_stasjon_gudbrandsdalen.json
- data/places/by/innlandet/kongsvinger_stasjon_grensebanen.json
- data/places/historie/innlandet/places_historie_innlandet_batch15.json
- data/places/by/innlandet/elverum_stasjon_jernbanemiljo.json
- data/places/by/innlandet/tynset_stasjon_rorosbanen.json
- data/places/by/innlandet/moelv_stasjon_mjoslinjen.json
- data/places/by/innlandet/stange_stasjon_dovrebanen.json
- data/places/by/innlandet/gran_stasjon_gjovikbanen.json
- data/places/by/innlandet/lena_stasjon_totenbanen.json
- data/places/by/innlandet/reinsvoll_stasjon_totenbanen.json
- data/places/by/innlandet/dokka_stasjon_valdresbanen.json
- data/places/by/innlandet/skarnes_stasjon_kongsvingerbanen.json
- data/places/naeringsliv/innlandet/braskereidfoss_kraftverk.json
- data/places/historie/innlandet/places_historie_innlandet_batch17.json
- data/places/by/innlandet/skreia_stasjon_totenbanen.json
- data/places/by/innlandet/flisa_stasjon_solorbanen.json
- data/places/historie/innlandet/places_historie_innlandet_batch18.json
- data/places/litteratur/innlandet/bjorgan_prestegard_kvikne.json
- data/places/naeringsliv/innlandet/einunna_kraftverk_folldal.json
- data/places/by/innlandet/os_stasjon_rorosbanen.json
- data/places/historie/vestfold/places_historie_vestfold_batch1.json
- data/places/naeringsliv/vestfold/eidsfoss_jernverk.json
- data/places/historie/vestfold/places_historie_vestfold_batch2.json
- data/places/historie/vestfold/places_historie_vestfold_batch3.json
- data/places/historie/vestfold/places_historie_vestfold_batch4.json
- data/places/by/vestfold/faerder_fyr.json
- data/places/historie/vestfold/places_historie_vestfold_batch5.json
- data/places/naeringsliv/vestfold/fritzoe_verk_larvik.json
- data/places/by/vestfold/sandefjord_kurbad.json
- data/places/naeringsliv/vestfold/vallo_saltverk.json
- data/places/historie/vestfold/places_historie_vestfold_batch6.json
- data/places/naeringsliv/vestfold/melsomvik_verft.json
- data/places/historie/vestfold/places_historie_vestfold_batch7.json
- data/places/by/vestfold/tollerodden_larvik.json
- data/places/by/vestfold/horten_stasjon_vestfoldbanen.json
- data/places/by/vestfold/tonsberg_stasjon_vestfoldbanen.json
- data/places/by/vestfold/sandefjord_stasjon_vestfoldbanen.json
- data/places/by/vestfold/larvik_stasjon_vestfoldbanen.json
- data/places/historie/telemark/places_historie_telemark_batch1.json
- data/places/naeringsliv/telemark/vemork_rjukan_industriarv.json
- data/places/by/telemark/telemarkskanalen_vrangfoss.json
- data/places/naeringsliv/telemark/notodden_industriarv_hydro.json
- data/places/historie/telemark/places_historie_telemark_batch2.json
- data/places/by/telemark/rjukanbanen_rjukan_stasjon.json
- data/places/by/telemark/tinnoset_stasjon_tinnosbanen.json
- data/places/naeringsliv/telemark/porsgrund_porselensfabrik.json
- data/places/historie/telemark/places_historie_telemark_batch3.json
- data/places/scenekunst/oslo/places_scenekunst.json
- data/places/sport/europa/norway/telemark/morgedal_norsk_skieventyr.json
- data/places/naeringsliv/telemark/dalen_hotel_tokke.json
- data/places/naeringsliv/telemark/ovre_verket_ulefoss.json
- data/places/historie/telemark/places_historie_telemark_batch4.json
- data/places/naeringsliv/telemark/svelgfoss_kraftverk_notodden.json
- data/places/by/telemark/brevik_byhistorie_tollbod.json
- data/places/by/telemark/lunde_sluse_telemarkskanalen.json
- data/places/by/telemark/kjeldal_sluse_telemarkskanalen.json
- data/places/by/telemark/hogga_sluse_telemarkskanalen.json
- data/places/historie/telemark/places_historie_telemark_batch5.json
- data/places/by/telemark/mael_stasjon_rjukanbanen.json
- data/places/by/telemark/df_ammonia_mael.json
- data/places/by/telemark/notodden_stasjon_industriarv.json
- data/places/naeringsliv/telemark/skotfoss_bruk_skien.json
- data/places/naeringsliv/telemark/heroya_industripark_porsgrunn.json
- data/places/historie/telemark/places_historie_telemark_batch6.json
- data/places/naeringsliv/telemark/saheim_kraftverk_rjukan.json
- data/places/naeringsliv/telemark/tinfos_industrimiljo_notodden.json
- data/places/politikk/telemark/menstad_bru_menstadslaget.json
- data/places/naeringsliv/telemark/klosteroya_union_skien.json
- data/places/litteratur/telemark/ibsen_venstop_skien.json
- data/places/historie/telemark/places_historie_telemark_batch7.json
- data/places/by/telemark/kragero_stasjon_kragerobanen.json
- data/places/by/telemark/treungen_stasjon_treungenbanen.json
- data/places/by/telemark/bo_stasjon_sorlandsbanen.json
- data/places/historie/agder/places_historie_agder_batch1.json
- data/places/by/agder/kristiansand_domkirke_byhistorie.json
- data/places/naeringsliv/agder/nes_jernverk_tvedestrand.json
- data/places/by/agder/ny_hellesund_uthavn_sogne.json
- data/places/by/agder/lindesnes_fyr.json
- data/places/naeringsliv/agder/knaben_gruver_kvinesdal.json
- data/places/historie/agder/places_historie_agder_batch2.json
- data/places/by/agder/mandal_kirke_byhistorie.json
- data/places/by/agder/tyholmen_arendal_byhistorie.json
- data/places/by/agder/grimstad_byhistorie_og_havn.json
- data/places/litteratur/agder/ibsen_museet_grimstad.json
- data/places/naeringsliv/agder/sjolingstad_ullvarefabrikk.json
- data/places/by/agder/risor_trehusby_byhistorie.json
- data/places/by/agder/tvedestrand_byhistorie_og_havn.json
- data/places/by/agder/flekkefjord_hollenderbyen.json
- data/places/by/agder/farsund_byhistorie_havn.json
- data/places/by/agder/lista_fyr.json
- data/places/historie/agder/lista_museum_vanse.json
- data/places/historie/agder/odderoya_militaerhistorie_kristiansand.json
- data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand.json
- data/places/historie/agder/stiftelsen_arkivet_kristiansand.json
- data/places/historie/agder/gimle_gard_kristiansand.json
- data/places/by/agder/setesdalsbanen_grovane.json
- data/places/naeringsliv/agder/hunsfos_fabrikker_vennesla.json
- data/places/naeringsliv/agder/flot_gruve_evje.json
- data/places/by/agder/lyngor_uthavn_tvedestrand.json
- data/places/historie/agder/dypvag_kirke_tvedestrand.json
- data/places/historie/agder/tromoy_kirke_arendal.json
- data/places/by/agder/posebyen_kristiansand_trehusby.json
- data/places/historie/agder/oddernes_kirke_kristiansand.json
- data/places/historie/agder/sogne_gamle_kirke_kristiansand.json
- data/places/by/agder/lillesand_byhistorie_og_havn.json
- data/places/by/agder/merdo_uthavn_arendal.json
- data/places/natur/agder/bragdoya_kystkultursenter.json
- data/places/by/agder/ryvingen_fyr_mandal.json
- data/places/naeringsliv/agder/froland_verk.json
- data/places/historie/agder/hylestad_gamle_kyrkjegard.json
- data/places/historie/agder/valle_kyrkje_setesdal.json
- data/places/historie/agder/bygland_museum.json
- data/places/historie/agder/spangereid_kirke_lindesnes.json
- data/places/by/agder/flekkefjordbanen_sira.json
- data/places/historie/agder/bakke_kirke_flekkefjord.json
- data/places/historie/agder/mandal_museum_andorsengarden.json
- data/places/historie/agder/ds_hestmanden_kristiansand.json
- data/places/historie/agder/holt_kirke_tvedestrand.json
- data/places/naeringsliv/agder/egeland_verk_gjerstad.json
- data/places/naeringsliv/agder/boylefoss_kraftverk_froland.json
- data/places/historie/agder/amli_kirke.json
- data/places/historie/agder/evjemoen_leir_evje.json
- data/places/historie/agder/hornnes_kirke.json
- data/places/historie/agder/lyngdal_kirke.json
- data/places/historie/agder/hidra_kirke_flekkefjord.json
- data/places/by/agder/arendal_gamle_radhus.json
- data/places/by/agder/kristiansand_gamle_tollbod.json
- data/places/by/agder/oksoy_fyr_kristiansand.json
- data/places/by/agder/gronningen_fyr_kristiansand.json
- data/places/historie/agder/gjerstad_kirke.json
- data/places/historie/agder/kvinesdal_kirke.json
- data/places/historie/agder/feda_kirke_kvinesdal.json
- data/places/historie/agder/haegebostad_kirke.json
- data/places/by/agder/risor_kirke_byhistorie.json
- data/places/historie/agder/sondeled_kirke_risor.json
- data/places/historie/agder/vegarshei_kirke.json
- data/places/historie/agder/birkenes_kirke.json
- data/places/historie/agder/iveland_kirke.json
- data/places/historie/agder/eiken_kirke_haegebostad.json
- data/places/historie/agder/konsmo_kirke_lyngdal.json
- data/places/historie/agder/tonstad_kirke_sirdal.json
- data/places/historie/agder/vestre_moland_kirke_lillesand.json
- data/places/historie/agder/hovag_kirke_lillesand.json
- data/places/historie/agder/herefoss_kirke_birkenes.json
- data/places/historie/agder/mykland_kirke_froland.json
- data/places/by/agder/dampskipet_bjoren_bygland.json
- data/places/historie/agder/nordberg_fort_lista.json
- data/places/historie/agder/flekkefjord_museum.json
- data/places/historie/agder/lillesand_by_og_sjofartsmuseum.json
- data/places/by/agder/torungen_fyr_arendal.json
- data/places/by/agder/homborsund_fyr_grimstad.json
- data/places/by/agder/nelaug_stasjon_amli.json
- data/places/by/agder/lillesand_flaksvandbanen.json
- data/places/by/agder/kristiansand_stasjon.json
- data/places/vitenskap/agder/agder_naturmuseum_kristiansand.json
- data/places/naeringsliv/agder/bomuldsfabriken_arendal.json
- data/places/by/agder/lista_flystasjon_farsund.json
- data/places/historie/agder/oyestad_kirke_arendal.json
- data/places/historie/agder/austre_moland_kirke_arendal.json
- data/places/by/agder/grimstad_kirke_byhistorie.json
- data/places/by/agder/arendal_stasjon.json
- data/places/by/agder/grimstad_stasjon_grimstadbanen.json
- data/places/naeringsliv/agder/tonstad_kraftverk_sirdal.json
- data/places/vitenskap/agder/kristiansand_katedralskole.json
- data/places/historie/agder/lund_batteri_kristiansand.json
- data/places/by/agder/trefoldighetskirken_arendal.json
- data/places/historie/agder/flosta_kirke_arendal.json
- data/places/historie/agder/landvik_kirke_grimstad.json
- data/places/historie/agder/eide_kirke_grimstad.json
- data/places/historie/agder/vanse_kirke_farsund.json
- data/places/by/agder/farsund_kirke_byhistorie.json
- data/places/by/agder/flekkefjord_kirke_byhistorie.json
- data/places/natur/agder/justoy_kystkultur_lillesand.json
- data/places/historie/agder/tingvatn_fornminnepark_haegebostad.json
- data/places/historie/agder/rygnestadtunet_valle.json
- data/places/natur/agder/ravnedalen_kristiansand.json
- data/places/historie/agder/vest_agder_museet_kongsgard.json
- data/places/by/agder/fullriggeren_sorlandet_kristiansand.json
- data/places/by/agder/spangereidkanalen_lindesnes.json
- data/places/naeringsliv/agder/pusnes_mekaniske_verksted_arendal.json
- data/places/by/agder/arendal_tollbod.json
- data/places/historie/agder/vigeland_hovedgard_lindesnes.json
- data/places/natur/agder/furulunden_mandal_kulturpark.json
- data/places/historie/agder/kristiansand_kanonmuseum_movik.json
- data/places/vitenskap/agder/evje_mineralsti.json
- data/places/vitenskap/agder/setesdal_mineralpark_evje.json
- data/places/kunst/agder/valle_sylvsmie_handverkshistorie.json
- data/places/historie/agder/risor_museum.json
- data/places/historie/agder/arendal_sjofartsmuseum.json
- data/places/historie/agder/boen_gard_kristiansand.json
- data/places/historie/agder/sogne_gamle_prestegard.json
- data/places/by/agder/kristiansand_lufthavn_kjevik.json
- data/places/by/agder/hollen_brygge_sogne.json
- data/places/natur/agder/skjernoy_kystkultur_lindesnes.json
- data/places/historie/agder/byremo_tingsted_lyngdal.json
- data/places/kunst/agder/arendal_kulturhus.json
- data/places/historie/agder/lindesnes_bygdemuseum.json
- data/places/scenekunst/agder/kilden_teater_konserthus_kristiansand.json
- data/places/by/agder/fiskebrygga_kristiansand.json
- data/places/natur/agder/baneheia_kristiansand_bypark.json
- data/places/vitenskap/agder/dommesmoen_grimstad.json
- data/places/naeringsliv/agder/laudal_kraftverk_lindesnes.json
- data/places/naeringsliv/agder/brokke_kraftverk_valle.json
- data/places/naeringsliv/agder/holen_kraftverk_bykle.json
- data/places/by/agder/audnedal_stasjon_lyngdal.json
- data/places/historie/norge/places_historie_norge_for_1500_batch1.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2.json
- data/places/politikk/vestland/gulatinget_flolid.json
- data/places/by/vestland/nordnes_bergen.json
- data/places/historie/norge/places_historie_norge_for_1500_batch3.json
- data/places/politikk/trondelag/frostatinget_logtun.json
- data/places/by/nordland/vagar_lofoten_storvagan.json
- data/places/historie/norge/places_historie_norge_for_1500_batch4.json
- data/places/by/utland_england/york_jorvik.json
- data/places/kunst/oslo/places_kunst.json
- data/places/litteratur/akershus/alf_proysen_statue_nittedal.json
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
- data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json
- data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json
- data/places/sport/europa/norway/places_motorsport_ostlandet.json
- data/places/sport/europa/england/footballgrounds_london.json
- data/places/subkultur/oslo/places_subkultur.json
- data/places/vitenskap/oslo/places_vitenskap.json
- data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner.json
- data/places/psykologi/oslo/places_psykologi.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json
- data/places/by/europe/portugal/lisbon/lisbon_aqueduto_das_aguas_livres.json
- data/places/by/europe/portugal/lisbon/lisbon_estacao_do_rossio.json
- data/places/politikk/europe/portugal/lisbon/lisbon_palacio_ajuda.json
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json
- data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json
- data/places/scenekunst/europe/portugal/lisbon/places_lisbon_scenekunst.json
- data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json
- data/places/sport/europa/portugal/footballgrounds_lisbon.json
- data/places/sport/europa/portugal/sportvenues_lisbon.json
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json
- data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json
- data/places/media/europe/portugal/lisbon/places_lisbon_media.json
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json
- data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json
- data/places/historie/vestland/etne/stodle_kyrkje.json
- data/places/historie/vestland/etne/helgaberget_etne.json
- data/places/historie/vestland/etne/borgasen_etne.json
- data/places/historie/vestland/etne/saebotunet_etne.json
- data/places/historie/vestland/etne/gjerde_kyrkje_etne.json
- data/places/historie/vestland/etne/grindheim_kyrkje_etne.json
- data/places/historie/vestland/etne/bruteigsteinen_etne.json
- data/places/historie/vestland/etne/duesteinen_etne.json
- data/places/historie/vestland/etne/postvegen_etne_skanevik.json
- data/places/historie/vestland/etne/gamle_akrafjordvegen.json
- data/places/historie/vestland/etne/skanevik_gjestgjevargarden.json
- data/places/historie/vestland/etne/driftevegen_stordalen_roldal.json
- data/places/historie/vestland/etne/postvegen_rullestadjuvet.json
- data/places/historie/vestland/etne/folgefonden_minnesmerke_skanevik.json
- data/places/historie/vestland/etne/reichwald_snublesteiner_skanevik.json
- data/places/historie/vestland/etne/sorheimsmoen_gravfelt.json
- data/places/historie/vestland/etne/grindheimsveien_nord_gravfelt.json
- data/places/historie/vestland/etne/steine_heio_bygdeborg.json
- data/places/historie/vestland/etne/tesdal_gravfelt.json
- data/places/historie/vestland/etne/etnesjoen_forromersk_landsby.json
- data/places/historie/vestland/etne/varhaug_nervik.json
- data/places/historie/vestland/etne/nesjarhaugen_byrkjenes.json
- data/places/historie/vestland/kvinnherad/gjerdesvagen_jernvinne.json
- data/places/historie/vestland/bomlo/grindheim_jernvinne.json
- data/places/historie/vestland/etne/keisarhaugen_frette.json
- data/places/historie/vestland/etne/dysjanes_rivaisen_gravroys.json
- data/places/historie/vestland/etne/hidlesnes_nernes_gravroys.json
- data/places/historie/vestland/etne/vardahaugen_lauareid.json
- data/places/historie/vestland/etne/stampehaug_meland.json
- data/places/historie/vestland/etne/hoyland_gravhaug_etne.json
- data/places/historie/vestland/etne/etne_prestebustad.json
- data/places/historie/vestland/etne/grindheim_steinkross.json
- data/places/historie/vestland/etne/grindheim_runestein.json
- data/places/historie/vestland/etne/skanevik_kyrkjestad.json
- data/places/historie/vestland/etne/fjaera_kapell.json
- data/places/naeringsliv/vestland/etne/norsk_motormuseum_skanevik.json
- data/places/naeringsliv/vestland/etne/sunnhordland_mek_verkstad_leknestangen.json
- data/places/naeringsliv/vestland/etne/skanevik_hermetikkfabrikk.json
- data/places/naeringsliv/vestland/etne/litledalen_kraftverk.json
- data/places/naeringsliv/vestland/etne/hardeland_kraftverk.json
- data/places/by/vestland/etne/etnesjoen_tettstad.json
- data/places/by/vestland/etne/etnesjoen_torg_og_kai.json
- data/places/by/vestland/etne/skanevik_sentrum.json
- data/places/by/vestland/etne/skanevik_ferjekai.json
- data/places/by/vestland/etne/kyrping_handelsstad.json
- data/places/kunst/vestland/etne/skakke_kultursenter_etne.json
- data/places/kunst/vestland/etne/skanevik_kultur_og_idrettshall.json
- data/places/kunst/vestland/etne/house_of_blues_skanevik.json
- data/places/kunst/vestland/etne/skanevik_fjordhotel_pippifestivalen.json
- data/places/kunst/vestland/etne/musikkpaviljongen_doktorhagen.json
- data/places/kunst/vestland/etne/old_river_saloon_etne.json
- data/places/kunst/vestland/etne/abc_studio_etne.json
- data/places/kunst/vestland/etne/fugl_fonix_etne.json
- data/places/litteratur/vestland/etne/olav_vik_garden_osnes.json
- data/places/litteratur/vestland/etne/ingvar_moe_byste_etne.json
- data/places/litteratur/vestland/etne/gurine_johan_ebnes_minde.json
- data/places/sport/vestland/etne/etne_idrettsanlegg.json
- data/places/sport/vestland/etne/steinsvollen_fotballanlegg.json
- data/places/sport/vestland/etne/engebanen_etne.json
- data/places/sport/vestland/etne/skanevik_idrettsanlegg.json
- data/places/sport/vestland/etne/etne_bmx_og_skatepark.json
- data/places/sport/vestland/etne/etne_tennisanlegg.json
- data/places/sport/vestland/etne/skanevik_skatepark.json
- data/places/sport/vestland/etne/sjokanten_trivsel_skanevik.json
- data/places/sport/vestland/etne/etne_kyokushin_dojo.json
- data/places/sport/vestland/etne/fikse_skytebane.json
- data/places/historie/oslo/places_historie/abelonegarden.json
- data/places/sport/vestland/etne/etne_pumptrack.json
- data/places/sport/vestland/etne/skakkeringen_etne.json
- data/places/sport/vestland/etne/osnes_discgolfbane.json
- data/places/sport/vestland/etne/skanevik_discgolf.json
- data/places/politikk/vestland/etne/etne_tinghus.json
- data/places/politikk/vestland/etne/etne_brannstasjon.json
- data/places/politikk/vestland/etne/skanevik_brannstasjon.json
- data/places/natur/vestland/langfoss_etne.json
- data/places/natur/vestland/akrafjorden.json
- data/places/natur/vestland/jettegrytene_rullestad.json
- data/places/natur/vestland/etneelva.json
- data/places/natur/vestland/stordalsvatnet_etne.json
- data/places/sport/vestland/etne/skanevik_skytebane.json
- data/places/natur/rogaland/vikedalselva.json
- data/places/natur/rogaland/vindafjorden.json
- data/places/natur/rogaland/svandalsfossen.json
- data/places/natur/rogaland/suldalslagen.json
- data/places/natur/rogaland/suldalsvatnet.json
- data/places/vitenskap/vestland/etne/etneelva_forskningsplattform.json
- data/places/media/vestland/etne/grannar_redaksjon_etne.json
- data/places/psykologi/vestland/etne/psykisk_helse_rus_etne.json
- data/places/psykologi/vestland/etne/psykisk_helse_rus_skanevik.json
- data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05.json
- data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06.json
- data/places/naeringsliv/oslo/places_naeringsliv_atlas_obscura_flop_batch_07.json
- data/places/vitenskap/oslo/places_vitenskap_oslo_kultureiendommer_batch_01.json
- data/places/sport/europa/norway/places_oslo_kultureiendommer_batch_01.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_02.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04.json
- data/places/litteratur/oslo/places_litteratur_oslo_kultureiendommer_batch_05.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_05.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_05.json
- data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_05.json
- data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_06.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_07.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_08.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_11.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_13.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_13.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json
- data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_04.json
- data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_04.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_art_sites_batch_01.json
- data/places/kunst/oslo/places_kunst_oslo_oppdag_kvadraturen_art_sites_batch_01.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_hovedstaden_batch_01.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_hovedstaden_batch_01.json
- data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_hovedstaden_batch_02.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_under_bakken_batch_01.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_stil_arkitektur_batch_01.json
- data/places/popkultur/oslo/places_populaerkultur_oslo_bla_skilt_2026_batch_01.json
- data/places/litteratur/oslo/places_litteratur_oslo_bla_skilt_2026_batch_01.json
- data/places/politikk/oslo/places_politikk_oslo_bla_skilt_2026_batch_01.json
- data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01.json
- data/places/historie/oslo/places_historie/norsk_folkemuseum.json
- data/places/historie/oslo/places_historie/norsk_maritimt_museum.json
- data/places/historie/oslo/places_historie/historisk_museum.json
- data/places/historie/oslo/places_historie/frogner_hovedgard.json
- data/places/historie/oslo/places_historie/arbeidermuseet.json
- data/places/historie/oslo/places_historie/nobels_fredssenter.json
- data/places/kunst/oslo/places_kunst/kunstnernes_hus.json
- data/places/kunst/oslo/places_kunst/vigelandmuseet.json
- data/places/historie/oslo/places_historie/mollergata_skole.json
- data/places/kunst/oslo/places_kunst/tbs_gallery.json
- data/places/historie/oslo/places_historie/viking_planet_oslo.json
- data/places/naeringsliv/oslo/places_naeringsliv/the_salmon_vitensenter.json
- data/places/historie/oslo/places_historie/jodisk_museum_oslo.json
- data/places/kunst/oslo/places_kunst/det_internasjonale_barnekunstmuseet.json
- data/places/litteratur/oslo/places_litteratur/ibsen_museum_teater.json
- data/places/vitenskap/oslo/places_vitenskap/oslo_reptilpark.json
- data/places/sport/europa/norway/oslo_sport/toyenbadet.json
- data/places/sport/europa/norway/oslo_sport/ekt_rideskole_husdyrpark.json
- data/places/kunst/oslo/places_kunst/dronning_sonja_kunststall.json
- data/places/sport/europa/norway/oslo_sport/holmlia_bad.json
- data/places/by/oslo/places/fagerborg_kirke.json
- data/places/by/oslo/places/uranienborg_kirke.json
- data/places/by/oslo/places/frogner_kirke.json
- data/places/historie/oslo/places_historie/vestre_gravlund.json
- data/places/sport/europa/norway/oslo_sport/skimore_oslo.json
- data/places/historie/oslo/places_historie/brannmuseet_oslo.json
- data/places/sport/europa/norway/oslo_sport/skoytemuseet.json
- data/places/by/oslo/places/vikaterrassen.json
- data/places/by/oslo/places/kampen_okologiske_barnebondegard.json
- data/places/vitenskap/oslo/places_vitenskap/klimahuset.json
- data/places/kunst/oslo/places_kunst/fotografiens_hus.json
- data/places/historie/oslo/places_historie/christian_radich.json
- data/places/historie/oslo/places_historie/central_jam_e_mosque.json
- data/places/historie/oslo/places_historie/toyen_hovedgard.json
- data/places/historie/oslo/places_historie/museumsleiligheten_grabein.json
- data/places/by/oslo/places/akrobaten_gangbro.json
- data/places/sport/europa/norway/oslo_sport/sorenga_sjobad.json
- data/places/historie/oslo/places_historie/ekeberg_helleristninger.json
- data/places/sport/europa/norway/oslo_sport/frigo_friluftssenteret.json
- data/places/kunst/oslo/places_kunst/galleri_map.json
- data/places/kunst/oslo/places_kunst/vi_vii_gallery.json
- data/places/kunst/oslo/places_kunst/the_oslo_gallery.json
- data/places/historie/oslo/places_historie/valerenga_kirke.json
- data/places/kunst/oslo/places_kunst/kunsthall_oslo.json
- data/places/historie/oslo/places_historie/mariakirken_ruin_oslo.json
- data/places/historie/oslo/places_historie/clemenskirken_ruin_oslo.json
- data/places/litteratur/oslo/places_litteratur/biblo_toyen.json
- data/places/historie/oslo/places_historie/ekebergparken_museum.json
- data/places/kunst/oslo/places_kunst/kosk_oslo.json
- data/places/kunst/oslo/places_kunst/galleri_mini_oslo.json
- data/places/kunst/oslo/places_kunst/van_etten.json
- data/places/sport/oslo/places_sport/jordal_ungdomshall.json
- data/places/historie/oslo/places_historie/gamlebyen_kirke.json
- data/places/kunst/oslo/places_kunst/oslo_prosjektrom.json
- data/places/natur/vestland/langebudalen_naturreservat.json
- data/places/natur/vestland/saevareidberget_landskapsvernomrade.json
- data/places/natur/vestland/brattholmen_naturreservat_etne.json
- data/places/natur/vestland/skano_naturreservat_etne.json
- data/places/historie/oslo/places_historie/paulus_kirke.json
- data/places/kunst/oslo/places_kunst/purenkel_galleri.json
- data/places/by/oslo/places/torshovparken.json
- data/places/kunst/oslo/places_kunst/hodet_nn_torshovdalen.json
- data/places/historie/oslo/places_historie/oscarshall.json
- data/places/historie/oslo/places_historie/vikingtidsmuseet.json
- data/places/historie/oslo/places_historie/bygdoy_kongsgard.json
- data/places/by/oslo/places/sukkerbiten_badstulandsby.json
- data/places/by/oslo/places/losaeter.json
- data/places/sport/europa/norway/oslo_sport/friluftshuset_sorenga.json
- data/places/sport/europa/norway/oslo_sport/operastranda.json
- data/places/natur/oslo/places_natur/bogstadvannet.json
- data/places/by/oslo/places/holmenkollen_kapell.json
- data/places/kunst/oslo/places_kunst/kollentrollet.json
- data/places/natur/oslo/places_natur/vettakollen.json
- data/places/kunst/oslo/places_kunst/kragstotten.json
- data/places/historie/oslo/places_historie/heggholmen.json
- data/places/natur/oslo/rambergoya.json
- data/places/by/oslo/places/ormoya.json
- data/places/natur/oslo/malmoya.json
- data/places/by/oslo/places/nakholmen.json
- data/places/by/oslo/places/lindoya.json
- data/places/natur/oslo/bleikoya.json
- data/places/by/oslo/places/ulvoya.json
- data/places/historie/akershus/steilene.json
- data/places/natur/akershus/langoyene.json
- data/places/historie/akershus/ingierstrand_bad.json
- data/places/sport/europa/norway/oslo_sport/oslo_golfklubb_bogstad.json
- data/places/historie/oslo/places_historie/holmenkollen_skimuseum.json
- data/places/by/oslo/frognerparken.json
- data/places/by/oslo/sofienbergparken.json
- data/places/by/oslo/torshovdalen.json
- data/places/natur/oslo/sognsvann.json
- data/places/by/oslo/kampen_park.json
- data/places/by/oslo/rudolf_nilsens_plass.json
- data/places/by/oslo/snippen_lekepark.json
- data/places/by/oslo/kirsebarlunden.json
- data/places/scenekunst/vestland/den_nationale_scene.json
- data/places/scenekunst/rogaland/rogaland_teater.json
- data/places/scenekunst/trondelag/trondelag_teater.json
- data/places/scenekunst/troms/halogaland_teater.json
- data/places/scenekunst/telemark/teater_ibsen.json
- data/places/scenekunst/nordland/nordland_teater.json
- data/places/scenekunst/more_og_romsdal/teatret_vart_plassen.json
- data/places/scenekunst/vestland/teater_vestland_nynorskhuset.json
- data/places/scenekunst/vestland/det_vestnorske_teateret.json
- data/places/scenekunst/finnmark/beaivvas_coarvematta.json
- data/places/subkultur/trondelag/uffa_huset_trondheim.json
- data/places/subkultur/trondelag/ressurssenter_kvinner_trondheim.json
- data/places/subkultur/vestland/nygardsparken_bergen.json
- data/places/subkultur/trondelag/svartlamon_trondheim.json
- data/places/subkultur/vestland/hulen_bergen.json
- data/places/subkultur/vestland/bergen_kjott_kulturhus.json
- data/places/subkultur/rogaland/tou_stavanger.json
- data/places/sport/oslo/voldslokka_pumptrack.json
- data/places/subkultur/trondelag/trikkestallen_skatepark_trondheim.json
- data/places/sport/vestland/fysak_slettebakken.json
- data/places/subkultur/akershus/arena_bekkestua.json
- data/places/subkultur/vestland/mo_senteret_gyldenpris.json
- data/places/subkultur/rogaland/matfellesskap_st_petri_stavanger.json
- data/places/subkultur/troms/kafe_x_tromso.json
- data/places/religion/vestland/etne/etne_kyrkje.json
- data/places/religion/vestland/etne/skanevik_kyrkje.json
- data/places/religion/vestland/etne/frette_kapell.json

## Harde feil
- Ingen

## Varsler
- data/places/by/oslo/places_by.json#gronland_basarene: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places_by.json#ring_3: lineært sted uten anchors
- data/places/by/oslo/places_by.json#ring_3: lav koordinatpresisjon (<4 desimaler)
- data/places/by/oslo/places_by.json#vulkan_energisentral: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places_by.json#christiania_torv: lineært sted uten anchors
- data/places/by/oslo/places_by.json#voienvolden: coordStatus=verified uten coordPrecisionM
- data/places/film/oslo/places_oslo_film.json#saga_kino: coordStatus=verified uten coordPrecisionM
- data/places/film/oslo/places_oslo_film.json#klingenberg_kino: coordStatus=verified uten coordPrecisionM
- data/places/film/oslo/places_oslo_film.json#gimle_kino: coordStatus=verified uten coordPrecisionM
- data/places/film/oslo/places_oslo_film.json#vika_kino: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie.json#gamle_aker_kirke: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie.json#villa_grande: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie.json#mollergata_19: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie.json#sagene_skole: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/oslo_domkirke.json#oslo_domkirke: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/gamle_trikkestallen.json#gamle_trikkestallen: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/slottet.json#slottet: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/sofienberg_kirke.json#sofienberg_kirke: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/trefoldighetskirken.json#trefoldighetskirken: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_added_batch_01.json#oslo_ladegard: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_added_batch_01.json#botsfengselet: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_added_batch_01.json#prinds_christian_augusts_minde: lineært sted uten anchors
- data/places/historie/oslo/places_historie_added_batch_01.json#peststotten_krist_kirkegard: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_added_batch_01.json#villa_stenersen: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_added_batch_01.json#st_hallvard_kirke_kloster: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/gamle_radhus.json#gamle_radhus: coordStatus=verified uten coordPrecisionM
- data/places/historie/akershus/places_historie_akershus_batch1.json#oscarsborg_festning: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/akershus/places_historie_akershus_batch1.json#trandumskogen: stort område uten coordNote/coordStatus
- data/places/naeringsliv/akershus/eidsvoll_verk_andelva.json#eidsvoll_verk_andelva: lineært sted uten anchors
- data/places/naeringsliv/akershus/eidsvoll_verk_andelva.json#eidsvoll_verk_andelva: stort område uten coordNote/coordStatus
- data/places/by/akershus/tertitten_urskog_holandsbanen.json#tertitten_urskog_holandsbanen: stort område uten coordNote/coordStatus
- data/places/naeringsliv/akershus/hurdal_verk_glassverk.json#hurdal_verk_glassverk: stort område uten coordNote/coordStatus
- data/places/naeringsliv/akershus/hakadal_verk.json#hakadal_verk: stort område uten coordNote/coordStatus
- data/places/historie/akershus/places_historie_akershus_batch5.json#aurskog_holand_bygdetun: stort område uten coordNote/coordStatus
- data/places/historie/akershus/places_historie_akershus_batch5.json#nannestad_bygdemuseum: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/ostfold/places_historie_ostfold_batch2.json#hoytorp_fort: stort område uten coordNote/coordStatus
- data/places/naeringsliv/ostfold/tistedalen_saugbrugsforeningen.json#tistedalen_saugbrugsforeningen: stort område uten coordNote/coordStatus
- data/places/historie/ostfold/places_historie_ostfold_batch4.json#akeroya_fort: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch1.json#veien_kulturminnepark: lineært sted uten anchors
- data/places/historie/buskerud/places_historie_buskerud_batch1.json#veien_kulturminnepark: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch1.json#uvdal_stavkirke: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch2.json#hallingdal_museum_nesbyen: stort område uten coordNote/coordStatus
- data/places/naeringsliv/buskerud/eggedal_molle.json#eggedal_molle: stort område uten coordNote/coordStatus
- data/places/by/buskerud/drammen_tollbod_havn.json#drammen_tollbod_havn: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch4.json#laagdalsmuseet: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch4.json#fiskum_gamle_kirke: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/buskerud/places_historie_buskerud_batch4.json#hvalsmoen_leir: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/buskerud/places_historie_buskerud_batch4.json#dagali_museum: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/buskerud/places_historie_buskerud_batch5.json#gulskogen_gard: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch5.json#hemsedal_bygdatun: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch5.json#krokkleiva_kongeveien: lineært sted uten anchors
- data/places/kunst/buskerud/hagan_skredsvig.json#hagan_skredsvig: lineært sted uten anchors
- data/places/historie/buskerud/places_historie_buskerud_batch6.json#lier_sykehus_historisk_omrade: stort område uten coordNote/coordStatus
- data/places/by/buskerud/vikersund_stasjon_randsfjordbanen.json#vikersund_stasjon_randsfjordbanen: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch2.json#norsk_skogmuseum_elverum: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch2.json#glomdalsmuseet_elverum: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch3.json#hundorp_dale_gudbrand: stort område uten coordNote/coordStatus
- data/places/naeringsliv/innlandet/folldal_gruver.json#folldal_gruver: stort område uten coordNote/coordStatus
- data/places/naeringsliv/innlandet/raufoss_industripark_ammunisjon.json#raufoss_industripark_ammunisjon: stort område uten coordNote/coordStatus
- data/places/politikk/innlandet/elverum_folkehogskole_1940.json#elverum_folkehogskole_1940: lineært sted uten anchors
- data/places/historie/innlandet/places_historie_innlandet_batch5.json#oye_stavkirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch5.json#hedalen_stavkirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch6.json#finnetunet_skogfinsk_museum: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch6.json#sor_fron_kirke_gudbrandsdalsdomen: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch6.json#odalstunet_sor_odal: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch6.json#eidskog_museum_almenninga: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch7.json#rendalen_bygdemuseum: stort område uten coordNote/coordStatus
- data/places/litteratur/innlandet/proysenstua_rudshogda.json#proysenstua_rudshogda: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch8.json#gausdal_bygdetun: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch9.json#husantunet_alvdal_bygdemuseum: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch9.json#koppangtunet_stor_elvdal: lineært sted uten anchors
- data/places/historie/innlandet/places_historie_innlandet_batch9.json#koppangtunet_stor_elvdal: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch9.json#tylldalen_bygdetun: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch10.json#nord_odal_bygdetun_sand: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch11.json#etnedal_bygdetun_bruflat: stort område uten coordNote/coordStatus
- data/places/naeringsliv/innlandet/mustad_hunnselva_gjovik.json#mustad_hunnselva_gjovik: lineært sted uten anchors
- data/places/naeringsliv/innlandet/mustad_hunnselva_gjovik.json#mustad_hunnselva_gjovik: stort område uten coordNote/coordStatus
- data/places/naeringsliv/innlandet/brumunddal_molle_industri.json#brumunddal_molle_industri: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch12.json#heidal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch13.json#aurdal_kirke: stort område uten coordNote/coordStatus
- data/places/naeringsliv/innlandet/espedalen_nikkelverk.json#espedalen_nikkelverk: lineært sted uten anchors
- data/places/naeringsliv/innlandet/espedalen_nikkelverk.json#espedalen_nikkelverk: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch14.json#sanderud_sykehus_historisk_omrade: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch14.json#romedal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch14.json#snertingdal_kirke: stort område uten coordNote/coordStatus
- data/places/by/innlandet/otta_stasjon_gudbrandsdalen.json#otta_stasjon_gudbrandsdalen: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch15.json#os_kirke_osterdalen: stort område uten coordNote/coordStatus
- data/places/by/innlandet/elverum_stasjon_jernbanemiljo.json#elverum_stasjon_jernbanemiljo: lineært sted uten anchors
- data/places/by/innlandet/moelv_stasjon_mjoslinjen.json#moelv_stasjon_mjoslinjen: lineært sted uten anchors
- data/places/historie/innlandet/places_historie_innlandet_batch17.json#grue_finnskog_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch17.json#alvdal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch18.json#oyer_kirke: stort område uten coordNote/coordStatus
- data/places/naeringsliv/innlandet/einunna_kraftverk_folldal.json#einunna_kraftverk_folldal: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch1.json#borrerhaugene_midgard: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch1.json#hvalfangstmuseet_sandefjord: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch2.json#molen_brunlanes_gravroysfelt: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch3.json#hoyjord_stavkirke: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch4.json#notteroy_kirke_faerder: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch4.json#kodal_kirke_sandefjord: stort område uten coordNote/coordStatus
- data/places/by/vestfold/sandefjord_kurbad.json#sandefjord_kurbad: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch6.json#svarstad_kirke_lardal: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch7.json#bastoy_skolehjem_horten: lineært sted uten anchors
- data/places/historie/vestfold/places_historie_vestfold_batch7.json#bastoy_skolehjem_horten: stort område uten coordNote/coordStatus
- data/places/by/vestfold/sandefjord_stasjon_vestfoldbanen.json#sandefjord_stasjon_vestfoldbanen: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch1.json#heddal_stavkirke: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch1.json#heddal_stavkirke: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/telemark/places_historie_telemark_batch1.json#brekkeparken_skien: stort område uten coordNote/coordStatus
- data/places/scenekunst/oslo/places_scenekunst.json#nationaltheatret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst.json#det_norske_teatret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst.json#chat_noir: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst.json#edderkoppen_scene: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst.json#latter: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst.json#folketeateret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst.json#operahuset: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst.json#black_box_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst.json#dansens_hus_oslo: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst.json#riksscenen: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst.json#oslo_nye_teater_hovedscenen: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst.json#det_andre_teatret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst.json#nordic_black_theatre_cafeteatret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst.json#centralteatret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst.json#grusomhetens_teater: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/telemark/morgedal_norsk_skieventyr.json#morgedal_norsk_skieventyr: stort område uten coordNote/coordStatus
- data/places/naeringsliv/telemark/dalen_hotel_tokke.json#dalen_hotel_tokke: stort område uten coordNote/coordStatus
- data/places/by/telemark/lunde_sluse_telemarkskanalen.json#lunde_sluse_telemarkskanalen: lav koordinatpresisjon (<4 desimaler)
- data/places/by/telemark/kjeldal_sluse_telemarkskanalen.json#kjeldal_sluse_telemarkskanalen: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch5.json#hjartdal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch5.json#drangedal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch5.json#nissedal_kyrkje: stort område uten coordNote/coordStatus
- data/places/naeringsliv/telemark/heroya_industripark_porsgrunn.json#heroya_industripark_porsgrunn: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch6.json#fyresdal_kyrkje: stort område uten coordNote/coordStatus
- data/places/naeringsliv/telemark/klosteroya_union_skien.json#klosteroya_union_skien: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch7.json#atra_kirke_tinn: lav koordinatpresisjon (<4 desimaler)
- data/places/by/telemark/bo_stasjon_sorlandsbanen.json#bo_stasjon_sorlandsbanen: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/agder/places_historie_agder_batch1.json#christiansholm_festning_kristiansand: lineært sted uten anchors
- data/places/historie/agder/places_historie_agder_batch1.json#setesdalsmuseet_rysstad: stort område uten coordNote/coordStatus
- data/places/by/agder/kristiansand_domkirke_byhistorie.json#kristiansand_domkirke_byhistorie: lineært sted uten anchors
- data/places/naeringsliv/agder/knaben_gruver_kvinesdal.json#knaben_gruver_kvinesdal: stort område uten coordNote/coordStatus
- data/places/historie/agder/places_historie_agder_batch2.json#mollenborg_kanonmuseum_kristiansand: lineært sted uten anchors
- data/places/historie/agder/places_historie_agder_batch2.json#mollenborg_kanonmuseum_kristiansand: lav koordinatpresisjon (<4 desimaler)
- data/places/by/agder/mandal_kirke_byhistorie.json#mandal_kirke_byhistorie: stort område uten coordNote/coordStatus
- data/places/by/agder/tyholmen_arendal_byhistorie.json#tyholmen_arendal_byhistorie: stort område uten coordNote/coordStatus
- data/places/by/agder/flekkefjord_hollenderbyen.json#flekkefjord_hollenderbyen: stort område uten coordNote/coordStatus
- data/places/historie/agder/odderoya_militaerhistorie_kristiansand.json#odderoya_militaerhistorie_kristiansand: lineært sted uten anchors
- data/places/historie/agder/odderoya_militaerhistorie_kristiansand.json#odderoya_militaerhistorie_kristiansand: stort område uten coordNote/coordStatus
- data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand.json#bredalsholmen_dokk_kristiansand: lineært sted uten anchors
- data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand.json#bredalsholmen_dokk_kristiansand: stort område uten coordNote/coordStatus
- data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand.json#bredalsholmen_dokk_kristiansand: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/agder/stiftelsen_arkivet_kristiansand.json#stiftelsen_arkivet_kristiansand: lineært sted uten anchors
- data/places/historie/agder/gimle_gard_kristiansand.json#gimle_gard_kristiansand: lineært sted uten anchors
- data/places/by/agder/setesdalsbanen_grovane.json#setesdalsbanen_grovane: stort område uten coordNote/coordStatus
- data/places/historie/agder/tromoy_kirke_arendal.json#tromoy_kirke_arendal: stort område uten coordNote/coordStatus
- data/places/by/agder/posebyen_kristiansand_trehusby.json#posebyen_kristiansand_trehusby: lineært sted uten anchors
- data/places/historie/agder/oddernes_kirke_kristiansand.json#oddernes_kirke_kristiansand: lineært sted uten anchors
- data/places/by/agder/lillesand_byhistorie_og_havn.json#lillesand_byhistorie_og_havn: lav koordinatpresisjon (<4 desimaler)
- data/places/by/agder/merdo_uthavn_arendal.json#merdo_uthavn_arendal: stort område uten coordNote/coordStatus
- data/places/natur/agder/bragdoya_kystkultursenter.json#bragdoya_kystkultursenter: stort område uten coordNote/coordStatus
- data/places/by/agder/ryvingen_fyr_mandal.json#ryvingen_fyr_mandal: stort område uten coordNote/coordStatus
- data/places/by/agder/ryvingen_fyr_mandal.json#ryvingen_fyr_mandal: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/agder/valle_kyrkje_setesdal.json#valle_kyrkje_setesdal: stort område uten coordNote/coordStatus
- data/places/historie/agder/spangereid_kirke_lindesnes.json#spangereid_kirke_lindesnes: lav koordinatpresisjon (<4 desimaler)
- data/places/by/agder/flekkefjordbanen_sira.json#flekkefjordbanen_sira: stort område uten coordNote/coordStatus
- data/places/historie/agder/bakke_kirke_flekkefjord.json#bakke_kirke_flekkefjord: stort område uten coordNote/coordStatus
- data/places/historie/agder/mandal_museum_andorsengarden.json#mandal_museum_andorsengarden: stort område uten coordNote/coordStatus
- data/places/historie/agder/ds_hestmanden_kristiansand.json#ds_hestmanden_kristiansand: lineært sted uten anchors
- data/places/naeringsliv/agder/boylefoss_kraftverk_froland.json#boylefoss_kraftverk_froland: stort område uten coordNote/coordStatus
- data/places/historie/agder/lyngdal_kirke.json#lyngdal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/agder/hidra_kirke_flekkefjord.json#hidra_kirke_flekkefjord: stort område uten coordNote/coordStatus
- data/places/by/agder/arendal_gamle_radhus.json#arendal_gamle_radhus: stort område uten coordNote/coordStatus
- data/places/by/agder/kristiansand_gamle_tollbod.json#kristiansand_gamle_tollbod: lineært sted uten anchors
- data/places/by/agder/oksoy_fyr_kristiansand.json#oksoy_fyr_kristiansand: lineært sted uten anchors
- data/places/by/agder/oksoy_fyr_kristiansand.json#oksoy_fyr_kristiansand: stort område uten coordNote/coordStatus
- data/places/by/agder/gronningen_fyr_kristiansand.json#gronningen_fyr_kristiansand: lineært sted uten anchors
- data/places/historie/agder/kvinesdal_kirke.json#kvinesdal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/agder/kvinesdal_kirke.json#kvinesdal_kirke: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/agder/feda_kirke_kvinesdal.json#feda_kirke_kvinesdal: stort område uten coordNote/coordStatus
- data/places/historie/agder/konsmo_kirke_lyngdal.json#konsmo_kirke_lyngdal: stort område uten coordNote/coordStatus
- data/places/historie/agder/tonstad_kirke_sirdal.json#tonstad_kirke_sirdal: stort område uten coordNote/coordStatus
- data/places/historie/agder/flekkefjord_museum.json#flekkefjord_museum: stort område uten coordNote/coordStatus
- data/places/by/agder/torungen_fyr_arendal.json#torungen_fyr_arendal: stort område uten coordNote/coordStatus
- data/places/by/agder/kristiansand_stasjon.json#kristiansand_stasjon: lineært sted uten anchors
- data/places/vitenskap/agder/agder_naturmuseum_kristiansand.json#agder_naturmuseum_kristiansand: lineært sted uten anchors
- data/places/naeringsliv/agder/bomuldsfabriken_arendal.json#bomuldsfabriken_arendal: stort område uten coordNote/coordStatus
- data/places/by/agder/lista_flystasjon_farsund.json#lista_flystasjon_farsund: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/agder/oyestad_kirke_arendal.json#oyestad_kirke_arendal: stort område uten coordNote/coordStatus
- data/places/historie/agder/austre_moland_kirke_arendal.json#austre_moland_kirke_arendal: stort område uten coordNote/coordStatus
- data/places/by/agder/arendal_stasjon.json#arendal_stasjon: stort område uten coordNote/coordStatus
- data/places/by/agder/grimstad_stasjon_grimstadbanen.json#grimstad_stasjon_grimstadbanen: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/agder/tonstad_kraftverk_sirdal.json#tonstad_kraftverk_sirdal: stort område uten coordNote/coordStatus
- data/places/vitenskap/agder/kristiansand_katedralskole.json#kristiansand_katedralskole: lineært sted uten anchors
- data/places/vitenskap/agder/kristiansand_katedralskole.json#kristiansand_katedralskole: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/agder/lund_batteri_kristiansand.json#lund_batteri_kristiansand: lineært sted uten anchors
- data/places/by/agder/trefoldighetskirken_arendal.json#trefoldighetskirken_arendal: stort område uten coordNote/coordStatus
- data/places/historie/agder/flosta_kirke_arendal.json#flosta_kirke_arendal: stort område uten coordNote/coordStatus
- data/places/by/agder/flekkefjord_kirke_byhistorie.json#flekkefjord_kirke_byhistorie: stort område uten coordNote/coordStatus
- data/places/natur/agder/justoy_kystkultur_lillesand.json#justoy_kystkultur_lillesand: stort område uten coordNote/coordStatus
- data/places/historie/agder/tingvatn_fornminnepark_haegebostad.json#tingvatn_fornminnepark_haegebostad: stort område uten coordNote/coordStatus
- data/places/natur/agder/ravnedalen_kristiansand.json#ravnedalen_kristiansand: lineært sted uten anchors
- data/places/natur/agder/ravnedalen_kristiansand.json#ravnedalen_kristiansand: stort område uten coordNote/coordStatus
- data/places/by/agder/fullriggeren_sorlandet_kristiansand.json#fullriggeren_sorlandet_kristiansand: lineært sted uten anchors
- data/places/by/agder/fullriggeren_sorlandet_kristiansand.json#fullriggeren_sorlandet_kristiansand: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/agder/pusnes_mekaniske_verksted_arendal.json#pusnes_mekaniske_verksted_arendal: stort område uten coordNote/coordStatus
- data/places/by/agder/arendal_tollbod.json#arendal_tollbod: stort område uten coordNote/coordStatus
- data/places/natur/agder/furulunden_mandal_kulturpark.json#furulunden_mandal_kulturpark: stort område uten coordNote/coordStatus
- data/places/historie/agder/kristiansand_kanonmuseum_movik.json#kristiansand_kanonmuseum_movik: lineært sted uten anchors
- data/places/vitenskap/agder/evje_mineralsti.json#evje_mineralsti: lineært sted uten anchors
- data/places/vitenskap/agder/setesdal_mineralpark_evje.json#setesdal_mineralpark_evje: stort område uten coordNote/coordStatus
- data/places/historie/agder/arendal_sjofartsmuseum.json#arendal_sjofartsmuseum: stort område uten coordNote/coordStatus
- data/places/historie/agder/boen_gard_kristiansand.json#boen_gard_kristiansand: lineært sted uten anchors
- data/places/by/agder/kristiansand_lufthavn_kjevik.json#kristiansand_lufthavn_kjevik: lineært sted uten anchors
- data/places/natur/agder/skjernoy_kystkultur_lindesnes.json#skjernoy_kystkultur_lindesnes: stort område uten coordNote/coordStatus
- data/places/historie/agder/byremo_tingsted_lyngdal.json#byremo_tingsted_lyngdal: stort område uten coordNote/coordStatus
- data/places/kunst/agder/arendal_kulturhus.json#arendal_kulturhus: stort område uten coordNote/coordStatus
- data/places/scenekunst/agder/kilden_teater_konserthus_kristiansand.json#kilden_teater_konserthus_kristiansand: lineært sted uten anchors
- data/places/by/agder/fiskebrygga_kristiansand.json#fiskebrygga_kristiansand: lineært sted uten anchors
- data/places/natur/agder/baneheia_kristiansand_bypark.json#baneheia_kristiansand_bypark: lineært sted uten anchors
- data/places/natur/agder/baneheia_kristiansand_bypark.json#baneheia_kristiansand_bypark: stort område uten coordNote/coordStatus
- data/places/naeringsliv/agder/laudal_kraftverk_lindesnes.json#laudal_kraftverk_lindesnes: stort område uten coordNote/coordStatus
- data/places/by/agder/audnedal_stasjon_lyngdal.json#audnedal_stasjon_lyngdal: stort område uten coordNote/coordStatus
- data/places/by/agder/audnedal_stasjon_lyngdal.json#audnedal_stasjon_lyngdal: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch1.json#stiklestad: lineært sted uten anchors
- data/places/historie/norge/places_historie_norge_for_1500_batch1.json#stiklestad: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch3.json#sekken_slagsted: lav koordinatpresisjon (<4 desimaler)
- data/places/by/nordland/vagar_lofoten_storvagan.json#vagar_lofoten_storvagan: lineært sted uten anchors
- data/places/historie/norge/places_historie_norge_for_1500_batch4.json#holmengra_hvaler: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch4.json#stamford_bridge_battlefield: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch4.json#jelling_kongsgard: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch4.json#orkney_birsay: lav koordinatpresisjon (<4 desimaler)
- data/places/kunst/oslo/places_kunst.json#nasjonalmuseet: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst.json#astrup_fearnley: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur.json#nasjonalbiblioteket: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur.json#grotta: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur.json#litteraturhuset: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur.json#tronsmo_bokhandel: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur.json#eldorado_bokhandel: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur.json#gamle_deichman: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur.json#deichman_grunerlokka: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur.json#kulturkirken_jakob_litteratur: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur.json#ruth_maier_minne: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur.json#inger_hagerups_plass: coordStatus=verified uten coordPrecisionM
- data/places/media/oslo/places_oslo_media.json#vg_huset: coordStatus=verified uten coordPrecisionM
- data/places/media/oslo/places_oslo_media.json#nrk_huset_marienlyst: coordStatus=verified uten coordPrecisionM
- data/places/media/oslo/places_oslo_media.json#klassekampen_redaksjon: coordStatus=verified uten coordPrecisionM
- data/places/musikk/oslo/places_musikk.json#rockefeller: coordStatus=verified uten coordPrecisionM
- data/places/musikk/oslo/places_musikk.json#john_dee: coordStatus=verified uten coordPrecisionM
- data/places/musikk/oslo/places_musikk.json#sentrum_scene: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv.json#havnelageret: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv.json#oslo_posthus: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv.json#vinmonopolet_lager: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv.json#jernbaneverkstedet_lodalen: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv.json#grunnlovsbygget_bankplassen: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv.json#fornebu_teknologipark: stort område uten coordNote/coordStatus
- data/places/naeringsliv/oslo/places_naeringsliv.json#akershus_energi: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/oslo/places_naeringsliv.json#schous_bryggeri: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv.json#ringnes_bryggeri: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv.json#oslo_kraftselskap: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv.json#vippetangen_fisketorg: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv.json#bryn_industriomrade: stort område uten coordNote/coordStatus
- data/places/naeringsliv/oslo/places_naeringsliv.json#christiania_seildugsfabrik: lineært sted uten anchors
- data/places/naeringsliv/oslo/places_naeringsliv.json#christiania_seildugsfabrik: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv.json#lilleborg_fabrikker: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv.json#akerselva_industri: lineært sted uten anchors
- data/places/naeringsliv/oslo/places_naeringsliv.json#akerselva_industri: stort område uten coordNote/coordStatus
- data/places/naeringsliv/oslo/places_naeringsliv.json#akerselva_industri: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_alna.json#alnaelva: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_alna.json#alnaelvstien: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_alna.json#alnaelvstien: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_alna.json#trosterud_friomrade: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_alna.json#furuset_haugerud_skogbelte: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#stilla_nydalen: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#bjoelsenparken_elvenaer: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#glads_molle: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#voien_gard_voienvolden: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#vulkan_industriomrade: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#elvestrekning_bla_brenneriveien: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#elvestrekning_bla_brenneriveien: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#fossveien_elvestrekning: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_akerselvarute.json#hausmannsomradet_elvelop: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_hovedsteder.json#alnaelva_hovedsteder: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#ljanselva_skullerud: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#ljanselva_hauketo: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#ljanselva_ljan: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#ljanselva_fiskevollen: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json#ljanselva_bunnefjorden: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_salamanderdammer.json#tjernsmyr_salamanderlokalitet: lav koordinatpresisjon (<4 desimaler)
- data/places/politikk/oslo/places_politikk.json#stortinget: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk.json#oslo_radhus: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk.json#tinghuset: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk.json#hoyesteretts_hus: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk.json#politihuset_gronland: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk.json#folkets_hus_oslo: coordStatus=verified uten coordPrecisionM
- data/places/popkultur/oslo/places_oslo_populaerkultur.json#cinemateket_oslo: coordStatus=verified uten coordPrecisionM
- data/places/popkultur/oslo/places_oslo_populaerkultur.json#house_of_nerds: coordStatus=verified uten coordPrecisionM
- data/places/popkultur/oslo/places_oslo_populaerkultur.json#chateau_neuf: coordStatus=verified uten coordPrecisionM
- data/places/popkultur/oslo/places_oslo_populaerkultur.json#grand_hotel: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/oslo_sport.json#kfum_arena: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/oslo_sport.json#nordre_aasen_idrettspark: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/places_motorsport_ostlandet.json#rudskogen_motorsenter: stort område uten coordNote/coordStatus
- data/places/sport/europa/norway/places_motorsport_ostlandet.json#gardermoen_motorpark: stort område uten coordNote/coordStatus
- data/places/sport/europa/norway/places_motorsport_ostlandet.json#finnskogbanen: stort område uten coordNote/coordStatus
- data/places/sport/europa/england/footballgrounds_london.json#wembley_stadium_london: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/europa/england/footballgrounds_london.json#stamford_bridge_london: lav koordinatpresisjon (<4 desimaler)
- data/places/subkultur/oslo/places_subkultur.json#hausmania: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#skur13: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#torggata_blad: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#bla: lav koordinatpresisjon (<4 desimaler)
- data/places/subkultur/oslo/places_subkultur.json#hausmannsgate_aksen: lineært sted uten anchors
- data/places/subkultur/oslo/places_subkultur.json#schweigaards_gate_lodalen: lineært sted uten anchors
- data/places/subkultur/oslo/places_subkultur.json#schweigaards_gate_lodalen: stort område uten coordNote/coordStatus
- data/places/subkultur/oslo/places_subkultur.json#kuba_akselpassasjer: lineært sted uten anchors
- data/places/subkultur/oslo/places_subkultur.json#blitzhuset: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#kafe_haerverk: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#brenneriveien_ingens_gate: lineært sted uten anchors
- data/places/subkultur/oslo/places_subkultur.json#brenneriveien_ingens_gate: lav koordinatpresisjon (<4 desimaler)
- data/places/subkultur/oslo/places_subkultur.json#gamlebyen_sport_og_fritid: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#oslo_skatehall: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#xray_ungdomskulturhus: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#vaterland_bar_scene: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#helvete_neseblod_records: lineært sted uten anchors
- data/places/subkultur/oslo/places_subkultur.json#last_train_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#rock_in_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#revolver_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#the_villa: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#jaeger_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#sub_scene: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#mir_grunerlokka_lufthavn: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#prindsen_mottakssenter: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#fyrlyset_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#evangeliesenteret_kontaktsenter_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#brugata_storgata_rusmiljo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#huset_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#nadheim_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur.json#motestedet_tollbugata: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap.json#universitetets_gamle_kjemi: coordStatus=verified uten coordPrecisionM
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
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json#lisbon_museu_arpad_szenes_vieira_da_silva: lav koordinatpresisjon (<4 desimaler)
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json#lisbon_museu_bordalo_pinheiro: lav koordinatpresisjon (<4 desimaler)
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json#lisbon_gremio_literario: lav koordinatpresisjon (<4 desimaler)
- data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json#lisbon_clube_de_fado: lav koordinatpresisjon (<4 desimaler)
- data/places/scenekunst/europe/portugal/lisbon/places_lisbon_scenekunst.json#lisbon_teatro_nacional_d_maria_ii: lav koordinatpresisjon (<4 desimaler)
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
- data/places/naeringsliv/vestland/etne/litledalen_kraftverk.json#litledalen_kraftverk: lav koordinatpresisjon (<4 desimaler)
- data/places/by/vestland/etne/kyrping_handelsstad.json#kyrping_handelsstad: lav koordinatpresisjon (<4 desimaler)
- data/places/kunst/vestland/etne/skanevik_fjordhotel_pippifestivalen.json#skanevik_fjordhotel_pippifestivalen: lineært sted uten anchors
- data/places/sport/vestland/etne/skanevik_idrettsanlegg.json#skanevik_idrettsanlegg: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/vestland/etne/etne_bmx_og_skatepark.json#etne_bmx_og_skatepark: stort område uten coordNote/coordStatus
- data/places/sport/vestland/etne/skanevik_skatepark.json#skanevik_skatepark: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/vestland/etneelva.json#etneelva: lineært sted uten anchors
- data/places/natur/rogaland/vikedalselva.json#vikedalselva: lineært sted uten anchors
- data/places/natur/rogaland/vikedalselva.json#vikedalselva: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/rogaland/suldalslagen.json#suldalslagen: lav koordinatpresisjon (<4 desimaler)
- data/places/vitenskap/vestland/etne/etneelva_forskningsplattform.json#etneelva_forskningsplattform: lineært sted uten anchors
- data/places/media/vestland/etne/grannar_redaksjon_etne.json#grannar_redaksjon_etne: coordStatus=verified uten coordPrecisionM
- data/places/psykologi/vestland/etne/psykisk_helse_rus_etne.json#psykisk_helse_rus_etne: coordStatus=verified uten coordPrecisionM
- data/places/psykologi/vestland/etne/psykisk_helse_rus_skanevik.json#psykisk_helse_rus_skanevik: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05.json#frammuseet: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05.json#kon_tiki_museet: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06.json#nordisk_bibelmuseum: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_atlas_obscura_flop_batch_07.json#flop_museum: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap_oslo_kultureiendommer_batch_01.json#folkeobservatoriet_holmenkollen: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/places_oslo_kultureiendommer_batch_01.json#kjeglebanen_langgaardslokken: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_02.json#radmannsgarden_og_anatomibygget: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_02.json#magistratgarden: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03.json#hauges_minde: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03.json#slurpen_lakkegata: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04.json#geitmyra_gard: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04.json#gronland_politistasjon: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04.json#toyen_trafo: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur_oslo_kultureiendommer_batch_05.json#honse_lovisas_hus: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_05.json#sagene_festivitetshus: lineært sted uten anchors
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_05.json#sagene_festivitetshus: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_05.json#etterstadgata_6: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_05.json#villa_furulund: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_06.json#villa_romsli: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_07.json#stubljan_paviljongen_hvervenbukta: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_08.json#trosterudvillaen: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json#sporveismuseet: lineært sted uten anchors
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json#sporveismuseet: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json#saxegarden: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json#ovre_fossum_gard: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json#lambertseter_gard: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json#nordre_skoyen_hovedgard: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json#lokomotivverkstedet: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json#tveten_gard: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_13.json#frysja_33_brekke_kraftstasjon: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json#steen_og_strom: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json#centralbanken_kirkegata: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json#kafe_grei: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json#borsen_oslo: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json#treschowgarden: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01.json#kirkeristen_basarene_brannvakten: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01.json#den_gamle_krigsskolen: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02.json#hotel_du_nord: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02.json#cafe_engebret: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json#garmanngarden: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json#stattholdergarden: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json#waisenhuset_kongens_gate: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json#myntgatakvartalet: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03.json#amerikalinjen: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03.json#dfds_bygget: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04.json#norges_bank_bankplassen_4: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_art_sites_batch_01.json#mustadgarden_kongens_gate_3: lineært sted uten anchors
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_art_sites_batch_01.json#mustadgarden_kongens_gate_3: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_hovedstaden_batch_01.json#avisen_tiden_radhusgata_10: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_hovedstaden_batch_01.json#sjofartsbygningen: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_hovedstaden_batch_02.json#schiollgarden_prinsens_gate_26: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_under_bakken_batch_01.json#norges_bank_bankplassen_2: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_stil_arkitektur_batch_01.json#kirkegata_5: coordStatus=verified uten coordPrecisionM
- data/places/popkultur/oslo/places_populaerkultur_oslo_bla_skilt_2026_batch_01.json#bla_skilt_aud_schonemann_vetlandsveien_69d: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur_oslo_bla_skilt_2026_batch_01.json#bla_skilt_stein_mehren_ullevalsveien_60: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk_oslo_bla_skilt_2026_batch_01.json#bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01.json#bla_skilt_helverschous_lokke_munkedamsveien_35: lineært sted uten anchors
- data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01.json#bla_skilt_helverschous_lokke_munkedamsveien_35: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01.json#bla_skilt_enerhaugen_samfund_smedgata_34: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/vestland/den_nationale_scene.json#den_nationale_scene: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/rogaland/rogaland_teater.json#rogaland_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/trondelag/trondelag_teater.json#trondelag_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/troms/halogaland_teater.json#halogaland_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/telemark/teater_ibsen.json#teater_ibsen: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/nordland/nordland_teater.json#nordland_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/more_og_romsdal/teatret_vart_plassen.json#teatret_vart_plassen: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/vestland/teater_vestland_nynorskhuset.json#teater_vestland_nynorskhuset: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/vestland/det_vestnorske_teateret.json#det_vestnorske_teateret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/finnmark/beaivvas_coarvematta.json#beaivvas_coarvematta: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/trondelag/uffa_huset_trondheim.json#uffa_huset_trondheim: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/trondelag/ressurssenter_kvinner_trondheim.json#ressurssenter_kvinner_trondheim: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/vestland/hulen_bergen.json#hulen_bergen: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/vestland/bergen_kjott_kulturhus.json#bergen_kjott_kulturhus: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/rogaland/tou_stavanger.json#tou_stavanger: coordStatus=verified uten coordPrecisionM
- data/places/sport/oslo/voldslokka_pumptrack.json#voldslokka_pumptrack: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/trondelag/trikkestallen_skatepark_trondheim.json#trikkestallen_skatepark_trondheim: coordStatus=verified uten coordPrecisionM
- data/places/sport/vestland/fysak_slettebakken.json#fysak_slettebakken: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/akershus/arena_bekkestua.json#arena_bekkestua: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/vestland/mo_senteret_gyldenpris.json#mo_senteret_gyldenpris: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/rogaland/matfellesskap_st_petri_stavanger.json#matfellesskap_st_petri_stavanger: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/troms/kafe_x_tromso.json#kafe_x_tromso: coordStatus=verified uten coordPrecisionM
- data/places/religion/vestland/etne/etne_kyrkje.json#etne_kyrkje: coordStatus=verified uten coordPrecisionM
- data/places/religion/vestland/etne/skanevik_kyrkje.json#skanevik_kyrkje: coordStatus=verified uten coordPrecisionM

## Coordinate review candidates

Totalt 744 signaler fordelt på 615 steder. Et sted kan ha flere signaler. Kandidatene under er gruppert etter grunn.

### Antall per grunn

| Grunn | Antall |
| --- | --- |
| coordStatus=verified uten coordPrecisionM | 187 |
| lineært sted uten anchors | 78 |
| lav koordinatpresisjon (<4 desimaler) | 83 |
| stasjon/park/gate/torg/elv uten coordinate metadata | 72 |
| park/stort område uten anchors eller coordNote | 130 |
| svært stor r (>=500 m) uten coordNote | 66 |
| svært liten r (<60 m) for sted som ser utstrakt ut | 2 |
| identisk/nesten identisk lat/lon som annet sted uten forklaring | 9 |
| ligger svært langt fra de andre stedene i samme fil | 117 |

### coordStatus=verified uten coordPrecisionM (187)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gronland_basarene | Grønland basarene | by | data/places/by/oslo/places_by.json | 59.91278287002734 | 10.76391148376898 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vulkan_energisentral | Vulkan energisentral | by | data/places/by/oslo/places_by.json | 59.92225253860743 | 10.751749415749577 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| voienvolden | Voienvolden | by | data/places/by/oslo/places_by.json | 59.93436330000289 | 10.75464137146488 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| saga_kino | Saga kino | populaerkultur | data/places/film/oslo/places_oslo_film.json | 59.914483496767964 | 10.73252179359581 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| klingenberg_kino | Klingenberg kino | populaerkultur | data/places/film/oslo/places_oslo_film.json | 59.913419951009054 | 10.732806189784029 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gimle_kino | Gimle kino | populaerkultur | data/places/film/oslo/places_oslo_film.json | 59.91723919101994 | 10.709250463305766 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vika_kino | Vika kino | populaerkultur | data/places/film/oslo/places_oslo_film.json | 59.913498581158905 | 10.7284586944203 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gamle_aker_kirke | Gamle Aker kirke | historie | data/places/historie/oslo/places_historie.json | 59.923779239528116 | 10.74681853984208 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| villa_grande | Villa Grande | historie | data/places/historie/oslo/places_historie.json | 59.89911019330011 | 10.678158888428362 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| mollergata_19 | Møllergata 19 | historie | data/places/historie/oslo/places_historie.json | 59.91528413168428 | 10.747869191554551 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sagene_skole | Sagene skole | historie | data/places/historie/oslo/places_historie.json | 59.93078969319966 | 10.75928429201007 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_domkirke | Oslo domkirke | by | data/places/by/oslo/oslo_domkirke.json | 59.91266533589023 | 10.746431229351575 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | by | data/places/by/oslo/gamle_trikkestallen.json | 59.93283549643305 | 10.768161829321377 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| slottet | Det kongelige slott | politikk | data/places/politikk/oslo/slottet.json | 59.917063045432855 | 10.727724636631736 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sofienberg_kirke | Sofienberg kirke | by | data/places/by/oslo/sofienberg_kirke.json | 59.922239531059745 | 10.765987821107696 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| trefoldighetskirken | Trefoldighetskirken | by | data/places/by/oslo/trefoldighetskirken.json | 59.91672903151453 | 10.744766562559661 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_ladegard | Oslo ladegård | historie | data/places/historie/oslo/places_historie_added_batch_01.json | 59.906175969346684 | 10.767673829543098 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| botsfengselet | Botsfengselet | historie | data/places/historie/oslo/places_historie_added_batch_01.json | 59.90971506327703 | 10.774997663433767 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| peststotten_krist_kirkegard | Peststøtten – Krist kirkegård | historie | data/places/historie/oslo/places_historie_added_batch_01.json | 59.917469 | 10.746586 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| villa_stenersen | Villa Stenersen | historie | data/places/historie/oslo/places_historie_added_batch_01.json | 59.939226276070805 | 10.698765324399833 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| st_hallvard_kirke_kloster | St. Hallvard kirke og kloster | historie | data/places/historie/oslo/places_historie_added_batch_01.json | 59.91294052851478 | 10.769571694450226 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gamle_radhus | Gamle rådhus | by | data/places/by/oslo/gamle_radhus.json | 59.909847408217715 | 10.740149053425348 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nationaltheatret | Nationaltheatret | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.91456789100917 | 10.733617256734934 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| det_norske_teatret | Det Norske Teatret | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.91521126103172 | 10.738641190958791 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| chat_noir | Chat Noir | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.91360791283421 | 10.732172099794877 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| edderkoppen_scene | Edderkoppen Scene | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.91815941203321 | 10.739832936543767 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| latter | Latter | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.91081373400813 | 10.726768537822347 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| folketeateret | Folketeateret | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.9145532904993 | 10.749678422671124 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| operahuset | Operahuset | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.90777660297918 | 10.752057851974856 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| black_box_teater | Black Box teater | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.92700508153591 | 10.768737228438797 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| dansens_hus_oslo | Dansens Hus | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.921391233585794 | 10.752559156734778 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| riksscenen | Riksscenen | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.91871322894722 | 10.761703929151963 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_nye_teater_hovedscenen | Oslo Nye Teater – Hovedscenen | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.91444272072215 | 10.739709939907648 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| det_andre_teatret | Det Andre Teatret | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.93874688851995 | 10.765362071425985 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nordic_black_theatre_cafeteatret | Nordic Black Theatre / Cafeteatret | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.91036041991715 | 10.767073643250859 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| centralteatret | Centralteatret | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.91458184873146 | 10.743455468460521 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| grusomhetens_teater | Grusomhetens Teater | scenekunst | data/places/scenekunst/oslo/places_scenekunst.json | 59.919148209457326 | 10.751977548509613 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nasjonalmuseet | Nasjonalmuseet | kunst | data/places/kunst/oslo/places_kunst.json | 59.91149437954434 | 10.729109219868187 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| astrup_fearnley | Astrup Fearnley Museet | kunst | data/places/kunst/oslo/places_kunst.json | 59.90679078788014 | 10.721563360663236 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nasjonalbiblioteket | Nasjonalbiblioteket | litteratur | data/places/litteratur/oslo/places_litteratur.json | 59.91429565254146 | 10.717362462417718 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| grotta | Grotten | litteratur | data/places/litteratur/oslo/places_litteratur.json | 59.918721365539604 | 10.731257963441367 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| litteraturhuset | Litteraturhuset | litteratur | data/places/litteratur/oslo/places_litteratur.json | 59.92027454485075 | 10.728566026476651 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tronsmo_bokhandel | Tronsmo Bokhandel | litteratur | data/places/litteratur/oslo/places_litteratur.json | 59.916504851005804 | 10.738621210337177 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| eldorado_bokhandel | Eldorado Bokhandel | litteratur | data/places/litteratur/oslo/places_litteratur.json | 59.91394802646695 | 10.747911617247832 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gamle_deichman | Gamle Deichman | litteratur | data/places/litteratur/oslo/places_litteratur.json | 59.91655515223004 | 10.74636730347388 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| deichman_grunerlokka | Deichman Grünerløkka | litteratur | data/places/litteratur/oslo/places_litteratur.json | 59.920789784433865 | 10.760221823170998 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kulturkirken_jakob_litteratur | Kulturkirken Jakob | litteratur | data/places/litteratur/oslo/places_litteratur.json | 59.9180329772343 | 10.754119014784367 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ruth_maier_minne | Ruth Maier-minnesmerke | litteratur | data/places/litteratur/oslo/places_litteratur.json | 59.922730001268235 | 10.737930723902437 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| inger_hagerups_plass | Inger Hagerups plass | litteratur | data/places/litteratur/oslo/places_litteratur.json | 59.9221744 | 10.853756 | 130 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vg_huset | VG-huset | media | data/places/media/oslo/places_oslo_media.json | 59.91512243824226 | 10.743666267309775 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nrk_huset_marienlyst | NRK-huset på Marienlyst | media | data/places/media/oslo/places_oslo_media.json | 59.934722555717045 | 10.719662425687908 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| klassekampen_redaksjon | Klassekampen-redaksjonen | media | data/places/media/oslo/places_oslo_media.json | 59.91335273517942 | 10.759577592129606 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| rockefeller | Rockefeller Music Hall | musikk | data/places/musikk/oslo/places_musikk.json | 59.916235041685646 | 10.750323246840185 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| john_dee | John Dee | musikk | data/places/musikk/oslo/places_musikk.json | 59.916145361023055 | 10.750313157984397 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sentrum_scene | Sentrum Scene | musikk | data/places/musikk/oslo/places_musikk.json | 59.91552200049789 | 10.751804295846025 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| havnelageret | Oslo Havnelager | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.90760281927637 | 10.746880614147818 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_posthus | Oslo Posthus | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.91038965689687 | 10.746007652609869 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vinmonopolet_lager | Vinmonopolets hovedlager | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.926820467284585 | 10.793178356826628 | 160 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| jernbaneverkstedet_lodalen | Lodalen jernbaneverksted | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.90436199249329 | 10.774336415114837 | 200 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.908727042084166 | 10.74038191009086 | 25 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| schous_bryggeri | Schous bryggeri | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.91871322894722 | 10.761703929151963 | 160 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ringnes_bryggeri | Ringnes bryggeri | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.930179384813485 | 10.759251969442406 | 160 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_kraftselskap | Oslo Lysverkers hovedkontor | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.915245305085435 | 10.719611579321567 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vippetangen_fisketorg | Fiskehallen på Vippetangen | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.90297426597389 | 10.740325792625368 | 100 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| christiania_seildugsfabrik | Christiania Seildugsfabrik | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9253444010033 | 10.75475549771365 | 180 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| lilleborg_fabrikker | Lilleborg Fabrikker | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.93729471693473 | 10.765821835434187 | 140 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| glads_molle | Glads mølle | historie | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.931850362845985 | 10.757873019733754 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| voien_gard_voienvolden | Vøien gård / Vøienvolden | historie | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.93436330000289 | 10.75464137146488 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vulkan_industriomrade | Vulkan industriområde | by | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.922646873289004 | 10.751204856903922 | 180 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| stortinget | Stortinget | politikk | data/places/politikk/oslo/places_politikk.json | 59.91321312337565 | 10.74032524097933 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_radhus | Oslo rådhus | politikk | data/places/politikk/oslo/places_politikk.json | 59.91174989125625 | 10.733452414128745 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tinghuset | Oslo tinghus | politikk | data/places/politikk/oslo/places_politikk.json | 59.915618872260445 | 10.741442136536953 | 30 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| hoyesteretts_hus | Høyesteretts hus | politikk | data/places/politikk/oslo/places_politikk.json | 59.914567897676186 | 10.744510031498768 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| politihuset_gronland | Politihuset på Grønland | politikk | data/places/politikk/oslo/places_politikk.json | 59.91076260893923 | 10.770099603960052 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| folkets_hus_oslo | Folkets Hus i Oslo | politikk | data/places/politikk/oslo/places_politikk.json | 59.9148900622556 | 10.750628039496302 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| cinemateket_oslo | Cinemateket i Oslo | film_tv | data/places/popkultur/oslo/places_oslo_populaerkultur.json | 59.90961165359811 | 10.745752189439866 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| house_of_nerds | House of Nerds | populaerkultur | data/places/popkultur/oslo/places_oslo_populaerkultur.json | 59.92186714382747 | 10.75148579082984 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| chateau_neuf | Chateau Neuf | populaerkultur | data/places/popkultur/oslo/places_oslo_populaerkultur.json | 59.93227611011727 | 10.71254747404495 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| grand_hotel | Grand Hotel | populaerkultur | data/places/popkultur/oslo/places_oslo_populaerkultur.json | 59.913745246491665 | 10.739476691613683 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kfum_arena | KFUM Arena | sport | data/places/sport/europa/norway/oslo_sport.json | 59.88862965039414 | 10.782076254654621 | 160 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nordre_aasen_idrettspark | Nordre Åsen idrettspark | sport | data/places/sport/europa/norway/oslo_sport.json | 59.94276845982983 | 10.784873923983723 | 170 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| hausmania | Hausmania | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.919148209457326 | 10.751977548509613 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| skur13 | Skur 13 | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.909652031188216 | 10.72082449208237 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| torggata_blad | Torggata Blad | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.91657334372696 | 10.75561428991178 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| blitzhuset | Blitzhuset | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.91840193086 | 10.73778846737114 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kafe_haerverk | Kafé Hærverk | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.919148209457326 | 10.751977548509613 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gamlebyen_sport_og_fritid | Gamlebyen Sport og Fritid | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.905411273181684 | 10.768437847106954 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_skatehall | Oslo Skatehall | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.94192173205158 | 10.752505988709485 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| xray_ungdomskulturhus | X-Ray Ungdomskulturhus | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.92065765555904 | 10.751597362221323 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vaterland_bar_scene | Vaterland Bar & Scene | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.91391103248318 | 10.756101476822108 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| last_train_oslo | Last Train | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.91457300863339 | 10.73664031059204 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| rock_in_oslo | Rock In | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.91312888495517 | 10.760871395801564 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| revolver_oslo | Revolver | musikk | data/places/subkultur/oslo/places_subkultur.json | 59.91699988365845 | 10.749742822662785 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| the_villa | The Villa | musikk | data/places/subkultur/oslo/places_subkultur.json | 59.91563512459411 | 10.74856019808857 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| jaeger_oslo | Jaeger | musikk | data/places/subkultur/oslo/places_subkultur.json | 59.913899495519225 | 10.743437565163234 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sub_scene | Sub Scene | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.912177321780405 | 10.736461501289167 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| mir_grunerlokka_lufthavn | MIR / Grünerløkka Lufthavn | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.92154264383429 | 10.761013090288696 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| prindsen_mottakssenter | Prindsen mottakssenter | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.91573563125075 | 10.756875795973647 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| fyrlyset_oslo | Fyrlyset | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.91519741735937 | 10.76402173101248 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| evangeliesenteret_kontaktsenter_oslo | Evangeliesenterets kontaktsenter | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.91558667149652 | 10.755045241412303 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| brugata_storgata_rusmiljo | Brugata / Storgata – det åpne rusmiljøet | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9146165881438 | 10.753026513871012 | 100 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| huset_oslo | Huset Oslo | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.923969075170824 | 10.726541485081306 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nadheim_oslo | Nadheim | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.91270580984919 | 10.765642283295504 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| motestedet_tollbugata | Møtestedet – Tollbugata | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.90976205545865 | 10.747280208188046 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | vitenskap | data/places/vitenskap/oslo/places_vitenskap.json | 59.917023156193885 | 10.73472914137377 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| grannar_redaksjon_etne | Grannar-redaksjonen i Etne | media | data/places/media/vestland/etne/grannar_redaksjon_etne.json | 59.66414439895677 | 5.940649457868514 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| psykisk_helse_rus_etne | Psykisk helse og rus – Etne | psykologi | data/places/psykologi/vestland/etne/psykisk_helse_rus_etne.json | 59.66534125070043 | 5.943034081601908 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| psykisk_helse_rus_skanevik | Psykisk helse og rus – Skånevik | psykologi | data/places/psykologi/vestland/etne/psykisk_helse_rus_skanevik.json | 59.73234389428389 | 5.935277893100119 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| frammuseet | Frammuseet | historie | data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05.json | 59.90320332524704 | 10.699091907892317 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kon_tiki_museet | Kon-Tiki Museet | historie | data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05.json | 59.90342401326082 | 10.698275332643746 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nordisk_bibelmuseum | Nordisk Bibelmuseum | historie | data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06.json | 59.910279645957665 | 10.740947844594505 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| flop_museum | FLOP Museum | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_atlas_obscura_flop_batch_07.json | 59.908255036287656 | 10.761378655427743 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| folkeobservatoriet_holmenkollen | Folkeobservatoriet | vitenskap | data/places/vitenskap/oslo/places_vitenskap_oslo_kultureiendommer_batch_01.json | 59.9605731651147 | 10.666638892994078 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kjeglebanen_langgaardslokken | Kjeglebanen på Langgaardsløkken | sport | data/places/sport/europa/norway/places_oslo_kultureiendommer_batch_01.json | 59.92335742553447 | 10.7148429989095 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| radmannsgarden_og_anatomibygget | Rådmannsgården og Anatomibygget | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_02.json | 59.91014146776003 | 10.740325400685213 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| magistratgarden | Magistratgården | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_02.json | 59.9092795875744 | 10.745055179458067 | 65 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| hauges_minde | Hauges Minde | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03.json | 59.92228111752553 | 10.75817184314198 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| slurpen_lakkegata | Slurpen | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03.json | 59.91931038465871 | 10.768086181233059 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| geitmyra_gard | Geitmyra gård | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04.json | 59.93719464243419 | 10.744320304993959 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gronland_politistasjon | Grønland politistasjon | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04.json | 59.91310411421603 | 10.76346350302876 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| toyen_trafo | Tøyen trafo | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04.json | 59.91708427752621 | 10.780668130159562 | 65 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| honse_lovisas_hus | Hønse-Lovisas hus | litteratur | data/places/litteratur/oslo/places_litteratur_oslo_kultureiendommer_batch_05.json | 59.930837365102796 | 10.757729935954078 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sagene_festivitetshus | Sagene festivitetshus | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_05.json | 59.93137049982586 | 10.760854064462801 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| etterstadgata_6 | Etterstadgata 6 | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_05.json | 59.90931822852265 | 10.791715634518276 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| villa_furulund | Villa Furulund | kunst | data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_05.json | 59.92642309728162 | 10.780148742091422 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| villa_romsli | Villa Romsli | kunst | data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_06.json | 59.96617126839898 | 10.899604528514946 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| stubljan_paviljongen_hvervenbukta | Stubljan-paviljongen i Hvervenbukta | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_07.json | 59.83391028057809 | 10.772352984625687 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| trosterudvillaen | Trosterudvillaen | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_08.json | 59.92348778601233 | 10.866602631958953 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sporveismuseet | Sporveismuseet | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json | 59.931307601915144 | 10.71602648075083 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| saxegarden | Saxegården | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json | 59.90362585545991 | 10.764945589472955 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ovre_fossum_gard | Øvre Fossum gård | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json | 59.95916207908544 | 10.927090991752289 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| lambertseter_gard | Lambertseter gård | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json | 59.8736713675549 | 10.814339406372168 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nordre_skoyen_hovedgard | Nordre Skøyen hovedgård | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json | 59.90761519680599 | 10.827573908322991 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| lokomotivverkstedet | Lokomotivverkstedet | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json | 59.90431860322039 | 10.763516120997933 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tveten_gard | Tveten gård | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json | 59.913061375377836 | 10.836900380109173 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| frysja_33_brekke_kraftstasjon | Frysja 33 – Brekke kraftstasjon | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_13.json | 59.96652761473437 | 10.776657553367157 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| steen_og_strom | Steen & Strøm | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json | 59.911562042330516 | 10.743066380237748 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| centralbanken_kirkegata | Centralbanken | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json | 59.910183744652514 | 10.743922294639356 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kafe_grei | Kafé Grei | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json | 59.907942752705715 | 10.744949249406519 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| borsen_oslo | Oslo Børs | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json | 59.90904377343142 | 10.747939911610652 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| treschowgarden | Treschowgården | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01.json | 59.9096247918653 | 10.74814929599479 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kirkeristen_basarene_brannvakten | Kirkeristen, Basarene og Brannvakten | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01.json | 59.912189597800115 | 10.747765502740915 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| den_gamle_krigsskolen | Den gamle Krigsskolen | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01.json | 59.909991452797726 | 10.745557526064319 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| hotel_du_nord | Hotel du Nord | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02.json | 59.90947510065043 | 10.745280045026805 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| cafe_engebret | Café Engebret | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02.json | 59.9089234456751 | 10.742103623159887 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| garmanngarden | Garmanngården | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json | 59.90905001695339 | 10.744756995654964 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| stattholdergarden | Stattholdergården | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json | 59.909372909195 | 10.74343267394393 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| waisenhuset_kongens_gate | Waisenhuset | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json | 59.90908688101301 | 10.740609982142896 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| myntgatakvartalet | Myntgatakvartalet | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02.json | 59.9090899572128 | 10.738471290497495 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| amerikalinjen | Amerikalinjen | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03.json | 59.91076457251223 | 10.749568439161244 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| dfds_bygget | DFDS-bygget | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03.json | 59.91137749505985 | 10.749403964838672 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| norges_bank_bankplassen_4 | Norges Bank – Bankplassen 4 | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04.json | 59.90866481462448 | 10.741285328997623 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| mustadgarden_kongens_gate_3 | Mustadgården – Kongens gate 3 | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_art_sites_batch_01.json | 59.90925646800815 | 10.740826309073695 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| avisen_tiden_radhusgata_10 | Avisen Tiden – Rådhusgata 10 | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_hovedstaden_batch_01.json | 59.909004916311204 | 10.744092944484954 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sjofartsbygningen | Sjøfartsbygningen | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_hovedstaden_batch_01.json | 59.90991497265444 | 10.741833670297687 | 75 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| schiollgarden_prinsens_gate_26 | Schiøllgården | by | data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_hovedstaden_batch_02.json | 59.91224425845788 | 10.739559115511142 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| norges_bank_bankplassen_2 | Norges Bank – Bankplassen 2 | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_under_bakken_batch_01.json | 59.90862371981983 | 10.742356165353511 | 90 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kirkegata_5 | Kirkegata 5 | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_stil_arkitektur_batch_01.json | 59.90929426367078 | 10.742588024864189 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_aud_schonemann_vetlandsveien_69d | Blått skilt: Aud Schønemann | populaerkultur | data/places/popkultur/oslo/places_populaerkultur_oslo_bla_skilt_2026_batch_01.json | 59.89860830471629 | 10.846650260193258 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_stein_mehren_ullevalsveien_60 | Blått skilt: Stein Mehren | litteratur | data/places/litteratur/oslo/places_litteratur_oslo_bla_skilt_2026_batch_01.json | 59.9302631186139 | 10.7366731375306 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5 | Blått skilt: Christopher Hornsrud | politikk | data/places/politikk/oslo/places_politikk_oslo_bla_skilt_2026_batch_01.json | 59.91573336836374 | 10.711784503719619 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_helverschous_lokke_munkedamsveien_35 | Blått skilt: Helverschous løkke | historie | data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01.json | 59.911785794838465 | 10.7259247905869 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_enerhaugen_samfund_smedgata_34 | Blått skilt: Enerhaugens Samfund | historie | data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01.json | 59.91369333254918 | 10.77036298230481 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| den_nationale_scene | Den Nationale Scene | scenekunst | data/places/scenekunst/vestland/den_nationale_scene.json | 60.39247577620086 | 5.320039546327612 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| rogaland_teater | Rogaland Teater | scenekunst | data/places/scenekunst/rogaland/rogaland_teater.json | 58.96551078762068 | 5.732785572923291 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| trondelag_teater | Trøndelag Teater | scenekunst | data/places/scenekunst/trondelag/trondelag_teater.json | 63.42934586047706 | 10.392085287246422 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| halogaland_teater | Hålogaland Teater | scenekunst | data/places/scenekunst/troms/halogaland_teater.json | 69.64220669937214 | 18.944678124887044 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| teater_ibsen | Teater Ibsen | scenekunst | data/places/scenekunst/telemark/teater_ibsen.json | 59.19811316291937 | 9.61481950506681 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nordland_teater | Nordland Teater | scenekunst | data/places/scenekunst/nordland/nordland_teater.json | 66.31034675678852 | 14.13993878644115 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| teatret_vart_plassen | Teatret Vårt – Plassen | scenekunst | data/places/scenekunst/more_og_romsdal/teatret_vart_plassen.json | 62.7362918885897 | 7.155736040879915 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| teater_vestland_nynorskhuset | Teater Vestland – Nynorskhuset | scenekunst | data/places/scenekunst/vestland/teater_vestland_nynorskhuset.json | 61.45241505945064 | 5.851296643693358 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| det_vestnorske_teateret | Det Vestnorske Teateret | scenekunst | data/places/scenekunst/vestland/det_vestnorske_teateret.json | 60.39209329114837 | 5.321321455865965 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| beaivvas_coarvematta | Beaivváš – Čoarvemátta | scenekunst | data/places/scenekunst/finnmark/beaivvas_coarvematta.json | 69.02031504216781 | 23.03692544410359 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| uffa_huset_trondheim | UFFA-huset | subkultur | data/places/subkultur/trondelag/uffa_huset_trondheim.json | 63.436369375015 | 10.429891680665307 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ressurssenter_kvinner_trondheim | Ressurssenter for kvinner | subkultur | data/places/subkultur/trondelag/ressurssenter_kvinner_trondheim.json | 63.427397941829156 | 10.392090968181554 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| hulen_bergen | Hulen | subkultur | data/places/subkultur/vestland/hulen_bergen.json | 60.38476280849749 | 5.325363307407874 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bergen_kjott_kulturhus | Bergen Kjøtt | subkultur | data/places/subkultur/vestland/bergen_kjott_kulturhus.json | 60.40188735772789 | 5.320559974203892 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tou_stavanger | Tou | subkultur | data/places/subkultur/rogaland/tou_stavanger.json | 58.96917440876424 | 5.75829995261127 | 110 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| voldslokka_pumptrack | Voldsløkka pumptrack | sport | data/places/sport/oslo/voldslokka_pumptrack.json | 59.943145607547194 | 10.754419844962298 | 140 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| trikkestallen_skatepark_trondheim | Trikkestallen Skatepark | subkultur | data/places/subkultur/trondelag/trikkestallen_skatepark_trondheim.json | 63.43966117350392 | 10.431940352632845 | 90 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| fysak_slettebakken | Fysak Slettebakken | sport | data/places/sport/vestland/fysak_slettebakken.json | 60.34892315756406 | 5.361581721031116 | 110 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| arena_bekkestua | Arena Bekkestua | subkultur | data/places/subkultur/akershus/arena_bekkestua.json | 59.920536290445376 | 10.582550428755052 | 100 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| mo_senteret_gyldenpris | MO-senteret Gyldenpris | subkultur | data/places/subkultur/vestland/mo_senteret_gyldenpris.json | 60.38300262501348 | 5.314376782207994 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| matfellesskap_st_petri_stavanger | Matfellesskap St. Petri | subkultur | data/places/subkultur/rogaland/matfellesskap_st_petri_stavanger.json | 58.97006703664689 | 5.7375038082000955 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kafe_x_tromso | Kafe X | subkultur | data/places/subkultur/troms/kafe_x_tromso.json | 69.65340838746769 | 18.95628570193868 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| etne_kyrkje | Etne kyrkje | religion | data/places/religion/vestland/etne/etne_kyrkje.json | 59.66966917268966 | 5.944394800224875 | 180 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| skanevik_kyrkje | Skånevik kyrkje | religion | data/places/religion/vestland/etne/skanevik_kyrkje.json | 59.731915140528194 | 5.939778902454844 | 180 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |

### lineært sted uten anchors (78)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ring_3 | Ring 3 | by | data/places/by/oslo/places_by.json | 59.931 | 10.792 | 400 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| christiania_torv | Christiania Torv | by | data/places/by/oslo/places_by.json | 59.9102351 | 10.7395879 | 150 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| prinds_christian_augusts_minde | Prinds Christian Augusts Minde | historie | data/places/historie/oslo/places_historie_added_batch_01.json | 59.9150905 | 10.7569061 | 120 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| eidsvoll_verk_andelva | Eidsvoll Verk / Andelva | naeringsliv | data/places/naeringsliv/akershus/eidsvoll_verk_andelva.json | 60.3297 | 11.2575 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| veien_kulturminnepark | Veien Kulturminnepark | historie | data/places/historie/buskerud/places_historie_buskerud_batch1.json | 60.1842 | 10.2504 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| krokkleiva_kongeveien | Krokkleiva / Den bergenske kongevei | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 60.0609 | 10.3092 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| hagan_skredsvig | Hagan / Christian Skredsvigs kunstnerhjem | kunst | data/places/kunst/buskerud/hagan_skredsvig.json | 60.2269 | 9.3317 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| elverum_folkehogskole_1940 | Elverum folkehøgskole / Elverumsfullmakten | politikk | data/places/politikk/innlandet/elverum_folkehogskole_1940.json | 60.8828 | 11.5599 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| koppangtunet_stor_elvdal | Koppangtunet / Stor-Elvdal museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 61.5708 | 11.0552 | 320 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| mustad_hunnselva_gjovik | Mustad / Hunnselva industrimiljø | naeringsliv | data/places/naeringsliv/innlandet/mustad_hunnselva_gjovik.json | 60.7894 | 10.6798 | 360 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| espedalen_nikkelverk | Espedalen nikkelverk | naeringsliv | data/places/naeringsliv/innlandet/espedalen_nikkelverk.json | 61.4248 | 9.6036 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| elverum_stasjon_jernbanemiljo | Elverum stasjon / jernbanemiljø | by | data/places/by/innlandet/elverum_stasjon_jernbanemiljo.json | 60.8818 | 11.5621 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| moelv_stasjon_mjoslinjen | Moelv stasjon / Mjøslinjen | by | data/places/by/innlandet/moelv_stasjon_mjoslinjen.json | 60.9337 | 10.7005 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| bastoy_skolehjem_horten | Bastøy skolehjem / institusjonshistorisk sted | historie | data/places/historie/vestfold/places_historie_vestfold_batch7.json | 59.3869 | 10.5318 | 620 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| christiansholm_festning_kristiansand | Christiansholm festning Kristiansand | historie | data/places/historie/agder/places_historie_agder_batch1.json | 58.1452 | 8.0012 | 320 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kristiansand_domkirke_byhistorie | Kristiansand domkirke / Kvadraturen | by | data/places/by/agder/kristiansand_domkirke_byhistorie.json | 58.1467 | 7.9956 | 320 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| mollenborg_kanonmuseum_kristiansand | Møvik fort / Kristiansand kanonmuseum | historie | data/places/historie/agder/places_historie_agder_batch2.json | 58.0915 | 7.966 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| odderoya_militaerhistorie_kristiansand | Odderøya militærhistorie Kristiansand | historie | data/places/historie/agder/odderoya_militaerhistorie_kristiansand.json | 58.1392 | 8.0026 | 520 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| bredalsholmen_dokk_kristiansand | Bredalsholmen dokk Kristiansand | naeringsliv | data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand.json | 58.0879 | 7.979 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| stiftelsen_arkivet_kristiansand | Arkivet Kristiansand | historie | data/places/historie/agder/stiftelsen_arkivet_kristiansand.json | 58.1547 | 7.9814 | 360 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| gimle_gard_kristiansand | Gimle gård Kristiansand | historie | data/places/historie/agder/gimle_gard_kristiansand.json | 58.1648 | 8.0039 | 340 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| posebyen_kristiansand_trehusby | Posebyen Kristiansand trehusby | by | data/places/by/agder/posebyen_kristiansand_trehusby.json | 58.1479 | 8.0005 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| oddernes_kirke_kristiansand | Oddernes kirke Kristiansand | historie | data/places/historie/agder/oddernes_kirke_kristiansand.json | 58.1646 | 8.0346 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ds_hestmanden_kristiansand | D/S Hestmanden Kristiansand | historie | data/places/historie/agder/ds_hestmanden_kristiansand.json | 58.1139 | 7.9847 | 340 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kristiansand_gamle_tollbod | Kristiansand gamle tollbod | by | data/places/by/agder/kristiansand_gamle_tollbod.json | 58.1443 | 7.9976 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| oksoy_fyr_kristiansand | Oksøy fyr Kristiansand | by | data/places/by/agder/oksoy_fyr_kristiansand.json | 58.0755 | 8.0523 | 520 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| gronningen_fyr_kristiansand | Grønningen fyr Kristiansand | by | data/places/by/agder/gronningen_fyr_kristiansand.json | 58.0813 | 8.0925 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kristiansand_stasjon | Kristiansand stasjon | by | data/places/by/agder/kristiansand_stasjon.json | 58.1457 | 7.9875 | 360 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| agder_naturmuseum_kristiansand | Agder naturmuseum Kristiansand | vitenskap | data/places/vitenskap/agder/agder_naturmuseum_kristiansand.json | 58.1635 | 8.0035 | 340 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kristiansand_katedralskole | Kristiansand katedralskole | vitenskap | data/places/vitenskap/agder/kristiansand_katedralskole.json | 58.1469 | 7.995 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lund_batteri_kristiansand | Lund batteri Kristiansand | historie | data/places/historie/agder/lund_batteri_kristiansand.json | 58.1489 | 8.0169 | 340 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ravnedalen_kristiansand | Ravnedalen Kristiansand | natur | data/places/natur/agder/ravnedalen_kristiansand.json | 58.1597 | 7.9778 | 520 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| fullriggeren_sorlandet_kristiansand | Fullriggeren Sørlandet Kristiansand | by | data/places/by/agder/fullriggeren_sorlandet_kristiansand.json | 58.144 | 7.9941 | 360 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kristiansand_kanonmuseum_movik | Kristiansand kanonmuseum Møvik | historie | data/places/historie/agder/kristiansand_kanonmuseum_movik.json | 58.0826 | 7.9633 | 620 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| evje_mineralsti | Evje mineralsti | vitenskap | data/places/vitenskap/agder/evje_mineralsti.json | 58.5807 | 7.7901 | 520 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| boen_gard_kristiansand | Boen gård Kristiansand | historie | data/places/historie/agder/boen_gard_kristiansand.json | 58.2014 | 8.1118 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kristiansand_lufthavn_kjevik | Kristiansand lufthavn Kjevik | by | data/places/by/agder/kristiansand_lufthavn_kjevik.json | 58.2042 | 8.0854 | 650 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kilden_teater_konserthus_kristiansand | Kilden teater og konserthus Kristiansand | scenekunst | data/places/scenekunst/agder/kilden_teater_konserthus_kristiansand.json | 58.1442 | 7.9896 | 360 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| fiskebrygga_kristiansand | Fiskebrygga Kristiansand | by | data/places/by/agder/fiskebrygga_kristiansand.json | 58.1449 | 7.9918 | 320 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| baneheia_kristiansand_bypark | Baneheia Kristiansand bypark | natur | data/places/natur/agder/baneheia_kristiansand_bypark.json | 58.1518 | 7.9829 | 620 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| stiklestad | Stiklestad | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | 63.7956 | 11.559 | 220 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| vagar_lofoten_storvagan | Vågar i Storvågan/Kabelvåg | by | data/places/by/nordland/vagar_lofoten_storvagan.json | 68.2145 | 14.4759 | 260 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| christiania_seildugsfabrik | Christiania Seildugsfabrik | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9253444010033 | 10.75475549771365 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| akerselva_industri | Akerselva industriområde | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9286 | 10.758 | 260 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| alnaelvstien | Alnaelvstien | natur | data/places/natur/oslo/places_oslo_alna.json | 59.931 | 10.83 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| stilla_nydalen | Stilla ved Nydalen | natur | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.9449 | 10.7654 | 120 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| bjoelsenparken_elvenaer | Bjølsenparken (elvenær del) | natur | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.93914 | 10.75891 | 160 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | natur | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.923 | 10.7407 | 130 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| fossveien_elvestrekning | Fossveien – elvestrekning | natur | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.9218 | 10.7391 | 130 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | by | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.9197 | 10.7364 | 170 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_skullerud | Ljanselva ved Skullerud | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | 59.8627529 | 10.8450942 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_hauketo | Ljanselva ved Hauketo | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | 59.8506459 | 10.8094818 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_ljan | Ljanselva ved Ljan | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | 59.8465614 | 10.7911851 | 170 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_fiskevollen | Ljanselva ved Fiskevollen | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | 59.842638 | 10.7799991 | 140 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_bunnefjorden | Ljanselva – utløp i Fiskevollbukta | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | 59.8420614 | 10.775801 | 120 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| hausmannsgate_aksen | Hausmannsgate-aksen | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9189 | 10.7513 | 240 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| schweigaards_gate_lodalen | Schweigaards gate–Lodalen veggakse | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9077 | 10.7725 | 260 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kuba_akselpassasjer | Kuba-passasjene ved Akerselva | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9236 | 10.7558 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9186 | 10.757 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| helvete_neseblod_records | Helvete / Neseblod Records | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.908405 | 10.769545 | 80 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
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
| skanevik_fjordhotel_pippifestivalen | Skånevik Fjordhotel / Pippifestivalen | kunst | data/places/kunst/vestland/etne/skanevik_fjordhotel_pippifestivalen.json | 59.73258264147061 | 5.931458034959808 | 240 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| etneelva | Etneelva | natur | data/places/natur/vestland/etneelva.json | 59.66611 | 5.94722 | 520 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| vikedalselva | Vikedalselva | natur | data/places/natur/rogaland/vikedalselva.json | 59.4977 | 5.903 | 650 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| etneelva_forskningsplattform | Nasjonal forskingsplattform i Etneelva | vitenskap | data/places/vitenskap/vestland/etne/etneelva_forskningsplattform.json | 59.66611 | 5.94722 | 120 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| sagene_festivitetshus | Sagene festivitetshus | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_05.json | 59.93137049982586 | 10.760854064462801 | 60 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| sporveismuseet | Sporveismuseet | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10.json | 59.931307601915144 | 10.71602648075083 | 60 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| mustadgarden_kongens_gate_3 | Mustadgården – Kongens gate 3 | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_art_sites_batch_01.json | 59.90925646800815 | 10.740826309073695 | 60 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| bla_skilt_helverschous_lokke_munkedamsveien_35 | Blått skilt: Helverschous løkke | historie | data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01.json | 59.911785794838465 | 10.7259247905869 | 35 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |

### lav koordinatpresisjon (<4 desimaler) (83)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ring_3 | Ring 3 | by | data/places/by/oslo/places_by.json | 59.931 | 10.792 | 400 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| oscarsborg_festning | Oscarsborg festning | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 59.676 | 10.606 | 360 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| nannestad_bygdemuseum | Nannestad bygdemuseum | historie | data/places/historie/akershus/places_historie_akershus_batch5.json | 60.217 | 11.012 | 260 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| fiskum_gamle_kirke | Fiskum gamle kirke | historie | data/places/historie/buskerud/places_historie_buskerud_batch4.json | 59.7069 | 9.805 | 260 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| hvalsmoen_leir | Hvalsmoen leir | historie | data/places/historie/buskerud/places_historie_buskerud_batch4.json | 60.207 | 10.277 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| dagali_museum | Dagali Museum | historie | data/places/historie/buskerud/places_historie_buskerud_batch4.json | 60.415 | 8.448 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| heddal_stavkirke | Heddal stavkirke | historie | data/places/historie/telemark/places_historie_telemark_batch1.json | 59.5794 | 9.176 | 360 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lunde_sluse_telemarkskanalen | Lunde sluse / Telemarkskanalen | by | data/places/by/telemark/lunde_sluse_telemarkskanalen.json | 59.297 | 9.1011 | 320 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| atra_kirke_tinn | Atrå kirke | historie | data/places/historie/telemark/places_historie_telemark_batch7.json | 59.9908 | 8.744 | 280 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| bo_stasjon_sorlandsbanen | Bø stasjon / Sørlandsbanen | by | data/places/by/telemark/bo_stasjon_sorlandsbanen.json | 59.4128 | 9.066 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| mollenborg_kanonmuseum_kristiansand | Møvik fort / Kristiansand kanonmuseum | historie | data/places/historie/agder/places_historie_agder_batch2.json | 58.0915 | 7.966 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| bredalsholmen_dokk_kristiansand | Bredalsholmen dokk Kristiansand | naeringsliv | data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand.json | 58.0879 | 7.979 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lillesand_byhistorie_og_havn | Lillesand byhistorie og havn | by | data/places/by/agder/lillesand_byhistorie_og_havn.json | 58.2485 | 8.378 | 520 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| ryvingen_fyr_mandal | Ryvingen fyr Mandal | by | data/places/by/agder/ryvingen_fyr_mandal.json | 57.9661 | 7.487 | 520 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| spangereid_kirke_lindesnes | Spangereid kirke Lindesnes | historie | data/places/historie/agder/spangereid_kirke_lindesnes.json | 58.038 | 7.1275 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| kvinesdal_kirke | Kvinesdal kirke | historie | data/places/historie/agder/kvinesdal_kirke.json | 58.3164 | 6.96 | 320 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lista_flystasjon_farsund | Lista flystasjon Farsund | by | data/places/by/agder/lista_flystasjon_farsund.json | 58.099 | 6.626 | 620 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| grimstad_stasjon_grimstadbanen | Grimstad stasjon / Grimstadbanen | by | data/places/by/agder/grimstad_stasjon_grimstadbanen.json | 58.342 | 8.5938 | 360 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| kristiansand_katedralskole | Kristiansand katedralskole | vitenskap | data/places/vitenskap/agder/kristiansand_katedralskole.json | 58.1469 | 7.995 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| fullriggeren_sorlandet_kristiansand | Fullriggeren Sørlandet Kristiansand | by | data/places/by/agder/fullriggeren_sorlandet_kristiansand.json | 58.144 | 7.9941 | 360 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| audnedal_stasjon_lyngdal | Audnedal stasjon Lyngdal | by | data/places/by/agder/audnedal_stasjon_lyngdal.json | 58.3238 | 7.354 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| stiklestad | Stiklestad | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | 63.7956 | 11.559 | 220 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| sekken_slagsted | Sekken slagsted og minnestein | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 62.647 | 7.3678 | 320 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| holmengra_hvaler | Holmengrå ved Hvaler | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 59.027 | 11.045 | 650 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| stamford_bridge_battlefield | Stamford Bridge battlefield | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 53.989 | -0.903 | 650 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| jelling_kongsgard | Jelling kongsgård og monumentområde | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 55.756 | 9.419 | 320 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| orkney_birsay | Brough of Birsay / Orknøyene | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 59.136 | -3.322 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| akershus_energi | Akershus Energi Varme | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.947 | 10.8355 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| akerselva_industri | Akerselva industriområde | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9286 | 10.758 | 260 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| alnaelva | Alnaelva | natur | data/places/natur/oslo/places_oslo_alna.json | 59.9325 | 10.833 | 400 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| alnaelvstien | Alnaelvstien | natur | data/places/natur/oslo/places_oslo_alna.json | 59.931 | 10.83 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| trosterud_friomrade | Trosterud friområde | natur | data/places/natur/oslo/places_oslo_alna.json | 59.9305 | 10.846 | 220 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| furuset_haugerud_skogbelte | Furuset–Haugerud skogbelte | natur | data/places/natur/oslo/places_oslo_alna.json | 59.9345 | 10.852 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | natur | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | 59.923 | 10.7407 | 130 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| alnaelva_hovedsteder | Alnaelva | natur | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | 59.9325 | 10.833 | 500 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | natur | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | 59.911 | 10.62714 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| wembley_stadium_london | Wembley Stadium | sport | data/places/sport/europa/england/footballgrounds_london.json | 51.556 | -0.2796 | 250 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| stamford_bridge_london | Stamford Bridge | sport | data/places/sport/europa/england/footballgrounds_london.json | 51.4817 | -0.191 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| bla | Blå | musikk | data/places/subkultur/oslo/places_subkultur.json | 59.9186 | 10.757 | 90 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
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
| lisbon_museu_arpad_szenes_vieira_da_silva | Museu Arpad Szenes – Vieira da Silva | kunst | data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json | 38.718 | -9.1543 | 80 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_museu_bordalo_pinheiro | Museu Bordalo Pinheiro | kunst | data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json | 38.7367 | -9.153 | 80 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_gremio_literario | Grémio Literário | litteratur | data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json | 38.711 | -9.1428 | 60 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_clube_de_fado | Clube de Fado | musikk | data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json | 38.71 | -9.1297 | 60 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_teatro_nacional_d_maria_ii | Teatro Nacional D. Maria II | scenekunst | data/places/scenekunst/europe/portugal/lisbon/places_lisbon_scenekunst.json | 38.714 | -9.139 | 80 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
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
| litledalen_kraftverk | Litledalen kraftverk | naeringsliv | data/places/naeringsliv/vestland/etne/litledalen_kraftverk.json | 59.66306 | 6.065 | 220 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| kyrping_handelsstad | Kyrping handelsstad | by | data/places/by/vestland/etne/kyrping_handelsstad.json | 59.75 | 6.11667 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| skanevik_idrettsanlegg | Skånevik idrettsanlegg | sport | data/places/sport/vestland/etne/skanevik_idrettsanlegg.json | 59.731 | 5.924 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| skanevik_skatepark | Skånevik skatepark | sport | data/places/sport/vestland/etne/skanevik_skatepark.json | 59.73 | 5.92 | 220 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| vikedalselva | Vikedalselva | natur | data/places/natur/rogaland/vikedalselva.json | 59.4977 | 5.903 | 650 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| suldalslagen | Suldalslågen | natur | data/places/natur/rogaland/suldalslagen.json | 59.48333 | 6.25 | 900 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |

### stasjon/park/gate/torg/elv uten coordinate metadata (72)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| nostvet_boplass | Nøstvet-boplassen | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 59.75109 | 10.7996 | 220 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| eidsvoll_verk_andelva | Eidsvoll Verk / Andelva | naeringsliv | data/places/naeringsliv/akershus/eidsvoll_verk_andelva.json | 60.3297 | 11.2575 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kjeller_flyplass | Kjeller flyplass | by | data/places/by/akershus/kjeller_flyplass.json | 59.96944 | 11.03889 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| stunner_boplass | Stunner steinalderboplass | historie | data/places/historie/akershus/places_historie_akershus_batch3.json | 59.74657 | 10.91747 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kornsjo_grensestasjon | Kornsjø stasjon / grensestasjon | by | data/places/by/ostfold/kornsjo_grensestasjon.json | 59.0974 | 11.6682 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| momarken_markedsplass | Momarken markedsplass | historie | data/places/historie/ostfold/places_historie_ostfold_batch6.json | 59.5584 | 11.3229 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| veien_kulturminnepark | Veien Kulturminnepark | historie | data/places/historie/buskerud/places_historie_buskerud_batch1.json | 60.1842 | 10.2504 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kroderbanen_kroderen_stasjon | Krøderbanen / Krøderen stasjon | by | data/places/by/buskerud/kroderbanen_kroderen_stasjon.json | 60.1359 | 9.7829 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| vikersund_stasjon_randsfjordbanen | Vikersund stasjon / Randsfjordbanen | by | data/places/by/buskerud/vikersund_stasjon_randsfjordbanen.json | 59.9655 | 9.9986 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| raufoss_industripark_ammunisjon | Raufoss industripark / ammunisjonsfabrikken | naeringsliv | data/places/naeringsliv/innlandet/raufoss_industripark_ammunisjon.json | 60.7299 | 10.6164 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| elverum_folkehogskole_1940 | Elverum folkehøgskole / Elverumsfullmakten | politikk | data/places/politikk/innlandet/elverum_folkehogskole_1940.json | 60.8828 | 11.5599 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| hamar_stasjon_jernbanebyen | Hamar stasjon / jernbanebyen | by | data/places/by/innlandet/hamar_stasjon_jernbanebyen.json | 60.7949 | 11.0678 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| koppangtunet_stor_elvdal | Koppangtunet / Stor-Elvdal museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 61.5708 | 11.0552 | 320 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| mustad_hunnselva_gjovik | Mustad / Hunnselva industrimiljø | naeringsliv | data/places/naeringsliv/innlandet/mustad_hunnselva_gjovik.json | 60.7894 | 10.6798 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| eina_stasjon_totenbanen | Eina stasjon / Totenbanen | by | data/places/by/innlandet/eina_stasjon_totenbanen.json | 60.6286 | 10.5988 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| espedalen_nikkelverk | Espedalen nikkelverk | naeringsliv | data/places/naeringsliv/innlandet/espedalen_nikkelverk.json | 61.4248 | 9.6036 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| fagernes_stasjon_valdresbanen | Fagernes stasjon / Valdresbanen | by | data/places/by/innlandet/fagernes_stasjon_valdresbanen.json | 60.9856 | 9.2339 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lillehammer_stasjon | Lillehammer stasjon | by | data/places/by/innlandet/lillehammer_stasjon.json | 61.1152 | 10.4637 | 280 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| dombas_stasjon_jernbaneknutepunkt | Dombås stasjon / jernbaneknutepunkt | by | data/places/by/innlandet/dombas_stasjon_jernbaneknutepunkt.json | 62.0697 | 9.1239 | 320 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| otta_stasjon_gudbrandsdalen | Otta stasjon / Gudbrandsdalen | by | data/places/by/innlandet/otta_stasjon_gudbrandsdalen.json | 61.7712 | 9.5352 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kongsvinger_stasjon_grensebanen | Kongsvinger stasjon / grensebanen | by | data/places/by/innlandet/kongsvinger_stasjon_grensebanen.json | 60.1907 | 12.0007 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| elverum_stasjon_jernbanemiljo | Elverum stasjon / jernbanemiljø | by | data/places/by/innlandet/elverum_stasjon_jernbanemiljo.json | 60.8818 | 11.5621 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| tynset_stasjon_rorosbanen | Tynset stasjon / Rørosbanen | by | data/places/by/innlandet/tynset_stasjon_rorosbanen.json | 62.2757 | 10.7828 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| moelv_stasjon_mjoslinjen | Moelv stasjon / Mjøslinjen | by | data/places/by/innlandet/moelv_stasjon_mjoslinjen.json | 60.9337 | 10.7005 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| stange_stasjon_dovrebanen | Stange stasjon / Dovrebanen | by | data/places/by/innlandet/stange_stasjon_dovrebanen.json | 60.7181 | 11.1941 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| gran_stasjon_gjovikbanen | Gran stasjon / Gjøvikbanen | by | data/places/by/innlandet/gran_stasjon_gjovikbanen.json | 60.3665 | 10.5608 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lena_stasjon_totenbanen | Lena stasjon / Totenbanen | by | data/places/by/innlandet/lena_stasjon_totenbanen.json | 60.6744 | 10.8138 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| reinsvoll_stasjon_totenbanen | Reinsvoll stasjon / Totenbanen | by | data/places/by/innlandet/reinsvoll_stasjon_totenbanen.json | 60.6798 | 10.6225 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| dokka_stasjon_valdresbanen | Dokka stasjon / Valdresbanen | by | data/places/by/innlandet/dokka_stasjon_valdresbanen.json | 60.8352 | 10.0719 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| skarnes_stasjon_kongsvingerbanen | Skarnes stasjon / Kongsvingerbanen | by | data/places/by/innlandet/skarnes_stasjon_kongsvingerbanen.json | 60.2536 | 11.6819 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| skreia_stasjon_totenbanen | Skreia stasjon / Totenbanen | by | data/places/by/innlandet/skreia_stasjon_totenbanen.json | 60.6504 | 10.9357 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| flisa_stasjon_solorbanen | Flisa stasjon / Solørbanen | by | data/places/by/innlandet/flisa_stasjon_solorbanen.json | 60.6095 | 12.0116 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| os_stasjon_rorosbanen | Os stasjon / Rørosbanen | by | data/places/by/innlandet/os_stasjon_rorosbanen.json | 62.4957 | 11.2235 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| borrerhaugene_midgard | Borreparken / Borre-haugene | historie | data/places/historie/vestfold/places_historie_vestfold_batch1.json | 59.3805 | 10.4686 | 620 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| horten_stasjon_vestfoldbanen | Horten stasjon / Vestfoldbanen | by | data/places/by/vestfold/horten_stasjon_vestfoldbanen.json | 59.4129 | 10.4825 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| tonsberg_stasjon_vestfoldbanen | Tønsberg stasjon / Vestfoldbanen | by | data/places/by/vestfold/tonsberg_stasjon_vestfoldbanen.json | 59.2709 | 10.4121 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| sandefjord_stasjon_vestfoldbanen | Sandefjord stasjon / Vestfoldbanen | by | data/places/by/vestfold/sandefjord_stasjon_vestfoldbanen.json | 59.1317 | 10.2244 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| larvik_stasjon_vestfoldbanen | Larvik stasjon / Vestfoldbanen | by | data/places/by/vestfold/larvik_stasjon_vestfoldbanen.json | 59.0525 | 10.0352 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| brekkeparken_skien | Brekkeparken Skien | historie | data/places/historie/telemark/places_historie_telemark_batch1.json | 59.2072 | 9.6005 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| rjukanbanen_rjukan_stasjon | Rjukanbanen / Rjukan stasjon | by | data/places/by/telemark/rjukanbanen_rjukan_stasjon.json | 59.8789 | 8.5927 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| tinnoset_stasjon_tinnosbanen | Tinnoset stasjon / Tinnosbanen | by | data/places/by/telemark/tinnoset_stasjon_tinnosbanen.json | 59.7048 | 9.0362 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| mael_stasjon_rjukanbanen | Mæl stasjon / Rjukanbanen | by | data/places/by/telemark/mael_stasjon_rjukanbanen.json | 59.8842 | 8.7526 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| notodden_stasjon_industriarv | Notodden stasjon / industriarv | by | data/places/by/telemark/notodden_stasjon_industriarv.json | 59.5602 | 9.2601 | 320 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| heroya_industripark_porsgrunn | Herøya industripark | naeringsliv | data/places/naeringsliv/telemark/heroya_industripark_porsgrunn.json | 59.1117 | 9.6405 | 520 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kragero_stasjon_kragerobanen | Kragerø stasjon / Kragerøbanen | by | data/places/by/telemark/kragero_stasjon_kragerobanen.json | 58.8699 | 9.4107 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| treungen_stasjon_treungenbanen | Treungen stasjon / Treungenbanen | by | data/places/by/telemark/treungen_stasjon_treungenbanen.json | 59.0215 | 8.5215 | 320 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| bo_stasjon_sorlandsbanen | Bø stasjon / Sørlandsbanen | by | data/places/by/telemark/bo_stasjon_sorlandsbanen.json | 59.4128 | 9.066 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| nelaug_stasjon_amli | Nelaug stasjon Åmli | by | data/places/by/agder/nelaug_stasjon_amli.json | 58.6592 | 8.6318 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kristiansand_stasjon | Kristiansand stasjon | by | data/places/by/agder/kristiansand_stasjon.json | 58.1457 | 7.9875 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lista_flystasjon_farsund | Lista flystasjon Farsund | by | data/places/by/agder/lista_flystasjon_farsund.json | 58.099 | 6.626 | 620 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| arendal_stasjon | Arendal stasjon | by | data/places/by/agder/arendal_stasjon.json | 58.4619 | 8.7723 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| grimstad_stasjon_grimstadbanen | Grimstad stasjon / Grimstadbanen | by | data/places/by/agder/grimstad_stasjon_grimstadbanen.json | 58.342 | 8.5938 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| tingvatn_fornminnepark_haegebostad | Tingvatn fornminnepark Hægebostad | historie | data/places/historie/agder/tingvatn_fornminnepark_haegebostad.json | 58.3752 | 7.2049 | 520 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| furulunden_mandal_kulturpark | Furulunden Mandal kulturpark | natur | data/places/natur/agder/furulunden_mandal_kulturpark.json | 58.0207 | 7.4525 | 620 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| setesdal_mineralpark_evje | Setesdal mineralpark Evje | vitenskap | data/places/vitenskap/agder/setesdal_mineralpark_evje.json | 58.5949 | 7.7867 | 460 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| baneheia_kristiansand_bypark | Baneheia Kristiansand bypark | natur | data/places/natur/agder/baneheia_kristiansand_bypark.json | 58.1518 | 7.9829 | 620 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| audnedal_stasjon_lyngdal | Audnedal stasjon Lyngdal | by | data/places/by/agder/audnedal_stasjon_lyngdal.json | 58.3238 | 7.354 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| fornebu_teknologipark | Fornebu Teknologipark | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.8939 | 10.6262 | 400 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| ulven_handelspark | Ulven handelspark | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9229 | 10.8215 | 200 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| akerselva_industri | Akerselva industriområde | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9286 | 10.758 | 260 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| gardermoen_motorpark | Gardermoen Motorpark | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 60.1832 | 11.1399 | 280 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| selhurst_park_london | Selhurst Park | sport | data/places/sport/europa/england/footballgrounds_london.json | 51.3983 | -0.0855 | 190 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| hausmannsgate_aksen | Hausmannsgate-aksen | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9189 | 10.7513 | 240 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| schweigaards_gate_lodalen | Schweigaards gate–Lodalen veggakse | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9077 | 10.7725 | 260 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kuba_akselpassasjer | Kuba-passasjene ved Akerselva | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9236 | 10.7558 | 180 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| forskningsparken | Forskningsparken | vitenskap | data/places/vitenskap/oslo/places_vitenskap.json | 59.9426 | 10.7192 | 150 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lisbon_maat | MAAT / Tejo-kraftstasjonen | kunst | data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json | 38.6953 | -9.1937 | 200 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lisbon_terminal_de_cruzeiros | Terminal de Cruzeiros de Lisboa | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json | 38.7142 | -9.1242 | 200 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lisbon_santa_apolonia_station | Santa Apolónia Station | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json | 38.714 | -9.1228 | 180 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| etnesjoen_torg_og_kai | Etnesjøen torg og kai | by | data/places/by/vestland/etne/etnesjoen_torg_og_kai.json | 59.66489494369154 | 5.934465720587056 | 260 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| etne_bmx_og_skatepark | Etne BMX- og skatepark | sport | data/places/sport/vestland/etne/etne_bmx_og_skatepark.json | 59.66795396985244 | 5.942168981207253 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| skanevik_skatepark | Skånevik skatepark | sport | data/places/sport/vestland/etne/skanevik_skatepark.json | 59.73 | 5.92 | 220 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |

### park/stort område uten anchors eller coordNote (130)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| trandumskogen | Trandumskogen | historie | data/places/historie/akershus/places_historie_akershus_batch1.json | 60.2189 | 11.1177 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| eidsvoll_verk_andelva | Eidsvoll Verk / Andelva | naeringsliv | data/places/naeringsliv/akershus/eidsvoll_verk_andelva.json | 60.3297 | 11.2575 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tertitten_urskog_holandsbanen | Tertitten / Urskog-Hølandsbanen | by | data/places/by/akershus/tertitten_urskog_holandsbanen.json | 59.98628 | 11.24367 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hurdal_verk_glassverk | Hurdal Verk / Hurdal Glassverk | naeringsliv | data/places/naeringsliv/akershus/hurdal_verk_glassverk.json | 60.45029 | 11.04809 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hakadal_verk | Hakadal Verk | naeringsliv | data/places/naeringsliv/akershus/hakadal_verk.json | 60.12083 | 10.82278 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| aurskog_holand_bygdetun | Aurskog-Høland bygdetun | historie | data/places/historie/akershus/places_historie_akershus_batch5.json | 59.7194 | 11.4598 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hoytorp_fort | Høytorp fort | historie | data/places/historie/ostfold/places_historie_ostfold_batch2.json | 59.5536 | 11.3317 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tistedalen_saugbrugsforeningen | Tistedalen / Saugbrugsforeningen | naeringsliv | data/places/naeringsliv/ostfold/tistedalen_saugbrugsforeningen.json | 59.1242 | 11.4492 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| akeroya_fort | Akerøya fort | historie | data/places/historie/ostfold/places_historie_ostfold_batch4.json | 59.0495 | 10.9136 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| veien_kulturminnepark | Veien Kulturminnepark | historie | data/places/historie/buskerud/places_historie_buskerud_batch1.json | 60.1842 | 10.2504 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| uvdal_stavkirke | Uvdal stavkirke | historie | data/places/historie/buskerud/places_historie_buskerud_batch1.json | 60.2677 | 8.5986 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hallingdal_museum_nesbyen | Hallingdal Museum Nesbyen | historie | data/places/historie/buskerud/places_historie_buskerud_batch2.json | 60.5652 | 9.1013 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| eggedal_molle | Eggedal Mølle | naeringsliv | data/places/naeringsliv/buskerud/eggedal_molle.json | 60.2311 | 9.3504 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| drammen_tollbod_havn | Drammen tollbod / havneområdet | by | data/places/by/buskerud/drammen_tollbod_havn.json | 59.7434 | 10.2066 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| laagdalsmuseet | Lågdalsmuseet | historie | data/places/historie/buskerud/places_historie_buskerud_batch4.json | 59.6678 | 9.6569 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| gulskogen_gard | Gulskogen gård | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 59.7336 | 10.1577 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hemsedal_bygdatun | Hemsedal Bygdatun / Øvre Løkji | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 60.8578 | 8.6409 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| lier_sykehus_historisk_omrade | Lier sykehus / historisk område | historie | data/places/historie/buskerud/places_historie_buskerud_batch6.json | 59.7867 | 10.2871 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| vikersund_stasjon_randsfjordbanen | Vikersund stasjon / Randsfjordbanen | by | data/places/by/buskerud/vikersund_stasjon_randsfjordbanen.json | 59.9655 | 9.9986 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| norsk_skogmuseum_elverum | Norsk Skogmuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch2.json | 60.8837 | 11.5627 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| glomdalsmuseet_elverum | Glomdalsmuseet | historie | data/places/historie/innlandet/places_historie_innlandet_batch2.json | 60.8848 | 11.5558 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hundorp_dale_gudbrand | Hundorp / Dale-Gudbrands gard | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 61.5486 | 9.9427 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| folldal_gruver | Folldal gruver | naeringsliv | data/places/naeringsliv/innlandet/folldal_gruver.json | 62.1321 | 9.9973 | 480 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| raufoss_industripark_ammunisjon | Raufoss industripark / ammunisjonsfabrikken | naeringsliv | data/places/naeringsliv/innlandet/raufoss_industripark_ammunisjon.json | 60.7299 | 10.6164 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| oye_stavkirke | Øye stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch5.json | 61.1713 | 8.3996 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hedalen_stavkirke | Hedalen stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch5.json | 60.6484 | 9.7327 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| finnetunet_skogfinsk_museum | Finnetunet / skogfinsk museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.4186 | 12.4019 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| sor_fron_kirke_gudbrandsdalsdomen | Sør-Fron kirke / Gudbrandsdalsdomen | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 61.5567 | 9.9407 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| odalstunet_sor_odal | Odalstunet | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.2521 | 11.6846 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| eidskog_museum_almenninga | Eidskog museum / Almenninga | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.0347 | 12.1291 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| rendalen_bygdemuseum | Rendalen bygdemuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 61.7585 | 11.1905 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| proysenstua_rudshogda | Prøysenstua / Rudshøgda | litteratur | data/places/litteratur/innlandet/proysenstua_rudshogda.json | 60.9127 | 10.7259 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| gausdal_bygdetun | Gausdal bygdetun | historie | data/places/historie/innlandet/places_historie_innlandet_batch8.json | 61.2344 | 10.2255 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| husantunet_alvdal_bygdemuseum | Husantunet / Alvdal bygdemuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 62.1086 | 10.6311 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| koppangtunet_stor_elvdal | Koppangtunet / Stor-Elvdal museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 61.5708 | 11.0552 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tylldalen_bygdetun | Tylldalen bygdetun | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 62.1826 | 10.7551 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| nord_odal_bygdetun_sand | Nord-Odal bygdetun / Sand | historie | data/places/historie/innlandet/places_historie_innlandet_batch10.json | 60.3894 | 11.5375 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| etnedal_bygdetun_bruflat | Etnedal bygdetun / Bruflat | historie | data/places/historie/innlandet/places_historie_innlandet_batch11.json | 60.8887 | 9.6424 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| mustad_hunnselva_gjovik | Mustad / Hunnselva industrimiljø | naeringsliv | data/places/naeringsliv/innlandet/mustad_hunnselva_gjovik.json | 60.7894 | 10.6798 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| brumunddal_molle_industri | Brumunddal mølle / industrimiljø | naeringsliv | data/places/naeringsliv/innlandet/brumunddal_molle_industri.json | 60.8825 | 10.9394 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| heidal_kirke | Heidal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch12.json | 61.7482 | 9.2701 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| aurdal_kirke | Aurdal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch13.json | 60.9236 | 9.4118 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| espedalen_nikkelverk | Espedalen nikkelverk | naeringsliv | data/places/naeringsliv/innlandet/espedalen_nikkelverk.json | 61.4248 | 9.6036 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| sanderud_sykehus_historisk_omrade | Sanderud sykehus / historisk område | historie | data/places/historie/innlandet/places_historie_innlandet_batch14.json | 60.7798 | 11.1805 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| romedal_kirke | Romedal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch14.json | 60.7493 | 11.2508 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| snertingdal_kirke | Snertingdal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch14.json | 60.8769 | 10.4596 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| otta_stasjon_gudbrandsdalen | Otta stasjon / Gudbrandsdalen | by | data/places/by/innlandet/otta_stasjon_gudbrandsdalen.json | 61.7712 | 9.5352 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| os_kirke_osterdalen | Os kirke Østerdalen | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 62.4962 | 11.2238 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| grue_finnskog_kirke | Grue Finnskog kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 60.4362 | 12.4486 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| alvdal_kirke | Alvdal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 62.1081 | 10.6302 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| oyer_kirke | Øyer kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch18.json | 61.2651 | 10.4131 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| einunna_kraftverk_folldal | Einunna kraftverk / Folldal | naeringsliv | data/places/naeringsliv/innlandet/einunna_kraftverk_folldal.json | 62.1341 | 10.0045 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| borrerhaugene_midgard | Borreparken / Borre-haugene | historie | data/places/historie/vestfold/places_historie_vestfold_batch1.json | 59.3805 | 10.4686 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hvalfangstmuseet_sandefjord | Hvalfangstmuseet Sandefjord | historie | data/places/historie/vestfold/places_historie_vestfold_batch1.json | 59.1307 | 10.2246 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| molen_brunlanes_gravroysfelt | Mølen gravrøyser | historie | data/places/historie/vestfold/places_historie_vestfold_batch2.json | 58.9696 | 9.8277 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hoyjord_stavkirke | Høyjord stavkirke | historie | data/places/historie/vestfold/places_historie_vestfold_batch3.json | 59.3047 | 10.1128 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| notteroy_kirke_faerder | Nøtterøy kirke | historie | data/places/historie/vestfold/places_historie_vestfold_batch4.json | 59.2278 | 10.4074 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| kodal_kirke_sandefjord | Kodal kirke | historie | data/places/historie/vestfold/places_historie_vestfold_batch4.json | 59.2203 | 10.1295 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| sandefjord_kurbad | Sandefjord Kurbad | by | data/places/by/vestfold/sandefjord_kurbad.json | 59.1291 | 10.2241 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| svarstad_kirke_lardal | Svarstad kirke / Lågendalen | historie | data/places/historie/vestfold/places_historie_vestfold_batch6.json | 59.4019 | 9.9592 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| bastoy_skolehjem_horten | Bastøy skolehjem / institusjonshistorisk sted | historie | data/places/historie/vestfold/places_historie_vestfold_batch7.json | 59.3869 | 10.5318 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| sandefjord_stasjon_vestfoldbanen | Sandefjord stasjon / Vestfoldbanen | by | data/places/by/vestfold/sandefjord_stasjon_vestfoldbanen.json | 59.1317 | 10.2244 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| heddal_stavkirke | Heddal stavkirke | historie | data/places/historie/telemark/places_historie_telemark_batch1.json | 59.5794 | 9.176 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| brekkeparken_skien | Brekkeparken Skien | historie | data/places/historie/telemark/places_historie_telemark_batch1.json | 59.2072 | 9.6005 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| morgedal_norsk_skieventyr | Morgedal / Norsk Skieventyr | sport | data/places/sport/europa/norway/telemark/morgedal_norsk_skieventyr.json | 59.4776 | 8.4267 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| dalen_hotel_tokke | Dalen Hotel | naeringsliv | data/places/naeringsliv/telemark/dalen_hotel_tokke.json | 59.4446 | 8.0081 | 340 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| kjeldal_sluse_telemarkskanalen | Kjeldal sluse / Telemarkskanalen | by | data/places/by/telemark/kjeldal_sluse_telemarkskanalen.json | 59.2961 | 9.1414 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hjartdal_kirke | Hjartdal kirke | historie | data/places/historie/telemark/places_historie_telemark_batch5.json | 59.6113 | 8.7386 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| drangedal_kirke | Drangedal kirke | historie | data/places/historie/telemark/places_historie_telemark_batch5.json | 59.0977 | 9.0582 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| nissedal_kyrkje | Nissedal kyrkje | historie | data/places/historie/telemark/places_historie_telemark_batch5.json | 59.1648 | 8.5147 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| heroya_industripark_porsgrunn | Herøya industripark | naeringsliv | data/places/naeringsliv/telemark/heroya_industripark_porsgrunn.json | 59.1117 | 9.6405 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| fyresdal_kyrkje | Fyresdal kyrkje | historie | data/places/historie/telemark/places_historie_telemark_batch6.json | 59.1886 | 8.0962 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| klosteroya_union_skien | Klosterøya / Union Bruk Skien | naeringsliv | data/places/naeringsliv/telemark/klosteroya_union_skien.json | 59.2044 | 9.6026 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| setesdalsmuseet_rysstad | Setesdalsmuseet Rysstad | historie | data/places/historie/agder/places_historie_agder_batch1.json | 59.0988 | 7.5353 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| knaben_gruver_kvinesdal | Knaben gruver Kvinesdal | naeringsliv | data/places/naeringsliv/agder/knaben_gruver_kvinesdal.json | 58.6746 | 7.0978 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| mandal_kirke_byhistorie | Mandal kirke / byhistorie | by | data/places/by/agder/mandal_kirke_byhistorie.json | 58.0276 | 7.4552 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tyholmen_arendal_byhistorie | Tyholmen Arendal | by | data/places/by/agder/tyholmen_arendal_byhistorie.json | 58.4597 | 8.7666 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| flekkefjord_hollenderbyen | Flekkefjord Hollenderbyen | by | data/places/by/agder/flekkefjord_hollenderbyen.json | 58.2972 | 6.6606 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| odderoya_militaerhistorie_kristiansand | Odderøya militærhistorie Kristiansand | historie | data/places/historie/agder/odderoya_militaerhistorie_kristiansand.json | 58.1392 | 8.0026 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| bredalsholmen_dokk_kristiansand | Bredalsholmen dokk Kristiansand | naeringsliv | data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand.json | 58.0879 | 7.979 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| setesdalsbanen_grovane | Setesdalsbanen Grovane | by | data/places/by/agder/setesdalsbanen_grovane.json | 58.2697 | 7.9737 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tromoy_kirke_arendal | Tromøy kirke Arendal | historie | data/places/historie/agder/tromoy_kirke_arendal.json | 58.4614 | 8.8739 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| merdo_uthavn_arendal | Merdø uthavn Arendal | by | data/places/by/agder/merdo_uthavn_arendal.json | 58.4148 | 8.7705 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| bragdoya_kystkultursenter | Bragdøya kystkultursenter | natur | data/places/natur/agder/bragdoya_kystkultursenter.json | 58.1258 | 7.9439 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| ryvingen_fyr_mandal | Ryvingen fyr Mandal | by | data/places/by/agder/ryvingen_fyr_mandal.json | 57.9661 | 7.487 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| valle_kyrkje_setesdal | Valle kyrkje Setesdal | historie | data/places/historie/agder/valle_kyrkje_setesdal.json | 59.2132 | 7.5361 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| flekkefjordbanen_sira | Flekkefjordbanen Sira | by | data/places/by/agder/flekkefjordbanen_sira.json | 58.4168 | 6.6629 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| bakke_kirke_flekkefjord | Bakke kirke Flekkefjord | historie | data/places/historie/agder/bakke_kirke_flekkefjord.json | 58.3807 | 6.6641 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| mandal_museum_andorsengarden | Mandal Museum / Andorsengården | historie | data/places/historie/agder/mandal_museum_andorsengarden.json | 58.0272 | 7.4538 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| boylefoss_kraftverk_froland | Bøylefoss kraftverk Froland | naeringsliv | data/places/naeringsliv/agder/boylefoss_kraftverk_froland.json | 58.5689 | 8.6412 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| lyngdal_kirke | Lyngdal kirke | historie | data/places/historie/agder/lyngdal_kirke.json | 58.1379 | 7.0704 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hidra_kirke_flekkefjord | Hidra kirke Flekkefjord | historie | data/places/historie/agder/hidra_kirke_flekkefjord.json | 58.2266 | 6.5727 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| arendal_gamle_radhus | Arendal gamle rådhus | by | data/places/by/agder/arendal_gamle_radhus.json | 58.4593 | 8.7661 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| oksoy_fyr_kristiansand | Oksøy fyr Kristiansand | by | data/places/by/agder/oksoy_fyr_kristiansand.json | 58.0755 | 8.0523 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| kvinesdal_kirke | Kvinesdal kirke | historie | data/places/historie/agder/kvinesdal_kirke.json | 58.3164 | 6.96 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| feda_kirke_kvinesdal | Feda kirke Kvinesdal | historie | data/places/historie/agder/feda_kirke_kvinesdal.json | 58.2673 | 6.8261 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| konsmo_kirke_lyngdal | Konsmo kirke Lyngdal | historie | data/places/historie/agder/konsmo_kirke_lyngdal.json | 58.2876 | 7.3591 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tonstad_kirke_sirdal | Tonstad kirke Sirdal | historie | data/places/historie/agder/tonstad_kirke_sirdal.json | 58.6629 | 6.7162 | 340 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| flekkefjord_museum | Flekkefjord museum | historie | data/places/historie/agder/flekkefjord_museum.json | 58.2971 | 6.6592 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| torungen_fyr_arendal | Torungen fyr Arendal | by | data/places/by/agder/torungen_fyr_arendal.json | 58.3927 | 8.7917 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| bomuldsfabriken_arendal | Bomuldsfabriken Arendal | naeringsliv | data/places/naeringsliv/agder/bomuldsfabriken_arendal.json | 58.4564 | 8.7467 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| oyestad_kirke_arendal | Øyestad kirke Arendal | historie | data/places/historie/agder/oyestad_kirke_arendal.json | 58.4299 | 8.7009 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| austre_moland_kirke_arendal | Austre Moland kirke Arendal | historie | data/places/historie/agder/austre_moland_kirke_arendal.json | 58.5084 | 8.7988 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| arendal_stasjon | Arendal stasjon | by | data/places/by/agder/arendal_stasjon.json | 58.4619 | 8.7723 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tonstad_kraftverk_sirdal | Tonstad kraftverk Sirdal | naeringsliv | data/places/naeringsliv/agder/tonstad_kraftverk_sirdal.json | 58.6622 | 6.7169 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| trefoldighetskirken_arendal | Trefoldighetskirken Arendal | by | data/places/by/agder/trefoldighetskirken_arendal.json | 58.4611 | 8.7668 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| flosta_kirke_arendal | Flosta kirke Arendal | historie | data/places/historie/agder/flosta_kirke_arendal.json | 58.4854 | 9.0167 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| flekkefjord_kirke_byhistorie | Flekkefjord kirke / byhistorie | by | data/places/by/agder/flekkefjord_kirke_byhistorie.json | 58.2978 | 6.6602 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| justoy_kystkultur_lillesand | Justøy kystkultur Lillesand | natur | data/places/natur/agder/justoy_kystkultur_lillesand.json | 58.2076 | 8.2864 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tingvatn_fornminnepark_haegebostad | Tingvatn fornminnepark Hægebostad | historie | data/places/historie/agder/tingvatn_fornminnepark_haegebostad.json | 58.3752 | 7.2049 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| ravnedalen_kristiansand | Ravnedalen Kristiansand | natur | data/places/natur/agder/ravnedalen_kristiansand.json | 58.1597 | 7.9778 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| pusnes_mekaniske_verksted_arendal | Pusnes mekaniske verksted Arendal | naeringsliv | data/places/naeringsliv/agder/pusnes_mekaniske_verksted_arendal.json | 58.4647 | 8.8222 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| arendal_tollbod | Arendal tollbod | by | data/places/by/agder/arendal_tollbod.json | 58.4589 | 8.7674 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| furulunden_mandal_kulturpark | Furulunden Mandal kulturpark | natur | data/places/natur/agder/furulunden_mandal_kulturpark.json | 58.0207 | 7.4525 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| setesdal_mineralpark_evje | Setesdal mineralpark Evje | vitenskap | data/places/vitenskap/agder/setesdal_mineralpark_evje.json | 58.5949 | 7.7867 | 460 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| arendal_sjofartsmuseum | Arendal sjøfartsmuseum | historie | data/places/historie/agder/arendal_sjofartsmuseum.json | 58.4595 | 8.7668 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| skjernoy_kystkultur_lindesnes | Skjernøy kystkultur Lindesnes | natur | data/places/natur/agder/skjernoy_kystkultur_lindesnes.json | 58.0008 | 7.5207 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| byremo_tingsted_lyngdal | Byremo tingsted Lyngdal | historie | data/places/historie/agder/byremo_tingsted_lyngdal.json | 58.4182 | 7.3837 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| arendal_kulturhus | Arendal kulturhus | kunst | data/places/kunst/agder/arendal_kulturhus.json | 58.4607 | 8.7665 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| baneheia_kristiansand_bypark | Baneheia Kristiansand bypark | natur | data/places/natur/agder/baneheia_kristiansand_bypark.json | 58.1518 | 7.9829 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| laudal_kraftverk_lindesnes | Laudal kraftverk Lindesnes | naeringsliv | data/places/naeringsliv/agder/laudal_kraftverk_lindesnes.json | 58.2695 | 7.5093 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| audnedal_stasjon_lyngdal | Audnedal stasjon Lyngdal | by | data/places/by/agder/audnedal_stasjon_lyngdal.json | 58.3238 | 7.354 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| fornebu_teknologipark | Fornebu Teknologipark | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.8939 | 10.6262 | 400 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| bryn_industriomrade | Bryn industriområde | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9129 | 10.8251 | 250 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| akerselva_industri | Akerselva industriområde | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv.json | 59.9286 | 10.758 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| rudskogen_motorsenter | Rudskogen Motorsenter | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 59.3759 | 11.2552 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| gardermoen_motorpark | Gardermoen Motorpark | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 60.1832 | 11.1399 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| finnskogbanen | Finnskogbanen | sport | data/places/sport/europa/norway/places_motorsport_ostlandet.json | 60.4513 | 12.1864 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| schweigaards_gate_lodalen | Schweigaards gate–Lodalen veggakse | subkultur | data/places/subkultur/oslo/places_subkultur.json | 59.9077 | 10.7725 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| etne_bmx_og_skatepark | Etne BMX- og skatepark | sport | data/places/sport/vestland/etne/etne_bmx_og_skatepark.json | 59.66795396985244 | 5.942168981207253 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |

### svært stor r (>=500 m) uten coordNote (66)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| kongsberg_solvverk | Kongsberg Sølvverk | naeringsliv | data/places/naeringsliv/buskerud/kongsberg_solvverk.json | 59.6817 | 9.6267 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| blaafarvevaerket_modum | Blaafarveværket | naeringsliv | data/places/naeringsliv/buskerud/blaafarvevaerket_modum.json | 59.9314 | 9.9202 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| maihaugen_lillehammer | Maihaugen | historie | data/places/historie/innlandet/places_historie_innlandet_batch1.json | 61.1124 | 10.4864 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| kaupang_bikjholberget | Kaupang / Bikjholberget | historie | data/places/historie/vestfold/places_historie_vestfold_batch1.json | 59.0474 | 10.0335 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| borrerhaugene_midgard | Borreparken / Borre-haugene | historie | data/places/historie/vestfold/places_historie_vestfold_batch1.json | 59.3805 | 10.4686 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| karljohansvern_horten | Karljohansvern Horten | historie | data/places/historie/vestfold/places_historie_vestfold_batch1.json | 59.4179 | 10.4891 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| molen_brunlanes_gravroysfelt | Mølen gravrøyser | historie | data/places/historie/vestfold/places_historie_vestfold_batch2.json | 58.9696 | 9.8277 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| bastoy_skolehjem_horten | Bastøy skolehjem / institusjonshistorisk sted | historie | data/places/historie/vestfold/places_historie_vestfold_batch7.json | 59.3869 | 10.5318 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| vemork_rjukan_industriarv | Vemork / Rjukan industriarv | naeringsliv | data/places/naeringsliv/telemark/vemork_rjukan_industriarv.json | 59.8712 | 8.4916 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| heroya_industripark_porsgrunn | Herøya industripark | naeringsliv | data/places/naeringsliv/telemark/heroya_industripark_porsgrunn.json | 59.1117 | 9.6405 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| ny_hellesund_uthavn_sogne | Ny-Hellesund uthavn | by | data/places/by/agder/ny_hellesund_uthavn_sogne.json | 58.0545 | 7.8314 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lindesnes_fyr | Lindesnes fyr | by | data/places/by/agder/lindesnes_fyr.json | 57.9824 | 7.0477 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| knaben_gruver_kvinesdal | Knaben gruver Kvinesdal | naeringsliv | data/places/naeringsliv/agder/knaben_gruver_kvinesdal.json | 58.6746 | 7.0978 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| risor_trehusby_byhistorie | Risør trehusby / byhistorie | by | data/places/by/agder/risor_trehusby_byhistorie.json | 58.7209 | 9.2348 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| tvedestrand_byhistorie_og_havn | Tvedestrand byhistorie og havn | by | data/places/by/agder/tvedestrand_byhistorie_og_havn.json | 58.6223 | 8.9312 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| flekkefjord_hollenderbyen | Flekkefjord Hollenderbyen | by | data/places/by/agder/flekkefjord_hollenderbyen.json | 58.2972 | 6.6606 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| farsund_byhistorie_havn | Farsund byhistorie og havn | by | data/places/by/agder/farsund_byhistorie_havn.json | 58.0956 | 6.8046 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lista_fyr | Lista fyr | by | data/places/by/agder/lista_fyr.json | 58.1097 | 6.5683 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| odderoya_militaerhistorie_kristiansand | Odderøya militærhistorie Kristiansand | historie | data/places/historie/agder/odderoya_militaerhistorie_kristiansand.json | 58.1392 | 8.0026 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lyngor_uthavn_tvedestrand | Lyngør uthavn Tvedestrand | by | data/places/by/agder/lyngor_uthavn_tvedestrand.json | 58.6338 | 9.1307 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lillesand_byhistorie_og_havn | Lillesand byhistorie og havn | by | data/places/by/agder/lillesand_byhistorie_og_havn.json | 58.2485 | 8.378 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| merdo_uthavn_arendal | Merdø uthavn Arendal | by | data/places/by/agder/merdo_uthavn_arendal.json | 58.4148 | 8.7705 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| bragdoya_kystkultursenter | Bragdøya kystkultursenter | natur | data/places/natur/agder/bragdoya_kystkultursenter.json | 58.1258 | 7.9439 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| ryvingen_fyr_mandal | Ryvingen fyr Mandal | by | data/places/by/agder/ryvingen_fyr_mandal.json | 57.9661 | 7.487 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| flekkefjordbanen_sira | Flekkefjordbanen Sira | by | data/places/by/agder/flekkefjordbanen_sira.json | 58.4168 | 6.6629 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| evjemoen_leir_evje | Evjemoen leir | historie | data/places/historie/agder/evjemoen_leir_evje.json | 58.5894 | 7.8038 | 500 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| oksoy_fyr_kristiansand | Oksøy fyr Kristiansand | by | data/places/by/agder/oksoy_fyr_kristiansand.json | 58.0755 | 8.0523 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| nordberg_fort_lista | Nordberg fort Lista | historie | data/places/historie/agder/nordberg_fort_lista.json | 58.0907 | 6.6212 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| torungen_fyr_arendal | Torungen fyr Arendal | by | data/places/by/agder/torungen_fyr_arendal.json | 58.3927 | 8.7917 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lista_flystasjon_farsund | Lista flystasjon Farsund | by | data/places/by/agder/lista_flystasjon_farsund.json | 58.099 | 6.626 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| tonstad_kraftverk_sirdal | Tonstad kraftverk Sirdal | naeringsliv | data/places/naeringsliv/agder/tonstad_kraftverk_sirdal.json | 58.6622 | 6.7169 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| justoy_kystkultur_lillesand | Justøy kystkultur Lillesand | natur | data/places/natur/agder/justoy_kystkultur_lillesand.json | 58.2076 | 8.2864 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| tingvatn_fornminnepark_haegebostad | Tingvatn fornminnepark Hægebostad | historie | data/places/historie/agder/tingvatn_fornminnepark_haegebostad.json | 58.3752 | 7.2049 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| ravnedalen_kristiansand | Ravnedalen Kristiansand | natur | data/places/natur/agder/ravnedalen_kristiansand.json | 58.1597 | 7.9778 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| spangereidkanalen_lindesnes | Spangereidkanalen Lindesnes | by | data/places/by/agder/spangereidkanalen_lindesnes.json | 58.0372 | 7.1268 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| furulunden_mandal_kulturpark | Furulunden Mandal kulturpark | natur | data/places/natur/agder/furulunden_mandal_kulturpark.json | 58.0207 | 7.4525 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| kristiansand_kanonmuseum_movik | Kristiansand kanonmuseum Møvik | historie | data/places/historie/agder/kristiansand_kanonmuseum_movik.json | 58.0826 | 7.9633 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| evje_mineralsti | Evje mineralsti | vitenskap | data/places/vitenskap/agder/evje_mineralsti.json | 58.5807 | 7.7901 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| kristiansand_lufthavn_kjevik | Kristiansand lufthavn Kjevik | by | data/places/by/agder/kristiansand_lufthavn_kjevik.json | 58.2042 | 8.0854 | 650 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| skjernoy_kystkultur_lindesnes | Skjernøy kystkultur Lindesnes | natur | data/places/natur/agder/skjernoy_kystkultur_lindesnes.json | 58.0008 | 7.5207 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| baneheia_kristiansand_bypark | Baneheia Kristiansand bypark | natur | data/places/natur/agder/baneheia_kristiansand_bypark.json | 58.1518 | 7.9829 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| dommesmoen_grimstad | Dømmesmoen Grimstad | vitenskap | data/places/vitenskap/agder/dommesmoen_grimstad.json | 58.3566 | 8.5714 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| laudal_kraftverk_lindesnes | Laudal kraftverk Lindesnes | naeringsliv | data/places/naeringsliv/agder/laudal_kraftverk_lindesnes.json | 58.2695 | 7.5093 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| brokke_kraftverk_valle | Brokke kraftverk Valle | naeringsliv | data/places/naeringsliv/agder/brokke_kraftverk_valle.json | 59.0677 | 7.5249 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| holen_kraftverk_bykle | Holen kraftverk Bykle | naeringsliv | data/places/naeringsliv/agder/holen_kraftverk_bykle.json | 59.4422 | 7.3834 | 560 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
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
| etnesjoen_tettstad | Etnesjøen / Etne sentrum | by | data/places/by/vestland/etne/etnesjoen_tettstad.json | 59.66480336942738 | 5.93304783527308 | 650 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| skanevik_sentrum | Skånevik sentrum | by | data/places/by/vestland/etne/skanevik_sentrum.json | 59.73304523331509 | 5.934334449411551 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| gurine_johan_ebnes_minde | Boksamlinga Gurine og Johan Ebnes Minde | litteratur | data/places/litteratur/vestland/etne/gurine_johan_ebnes_minde.json | 59.70492905372869 | 5.824738133852842 | 650 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| osnes_discgolfbane | Osnes Discgolfbane | sport | data/places/sport/vestland/etne/osnes_discgolfbane.json | 59.65026805681819 | 5.900616945851397 | 500 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |

### svært liten r (<60 m) for sted som ser utstrakt ut (2)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| norges_bank_bankplassen_4 | Norges Bank – Bankplassen 4 | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04.json | 59.90866481462448 | 10.741285328997623 | 55 | Navn/kategori tyder på park/gate/elv/område/rute/plass; vurder større r eller anchors. |
| bla_skilt_helverschous_lokke_munkedamsveien_35 | Blått skilt: Helverschous løkke | historie | data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01.json | 59.911785794838465 | 10.7259247905869 | 35 | Navn/kategori tyder på park/gate/elv/område/rute/plass; vurder større r eller anchors. |

### identisk/nesten identisk lat/lon som annet sted uten forklaring (9)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| bla | Blå | musikk | data/places/subkultur/oslo/places_subkultur.json | 59.9186 | 10.757 | 90 | Deler punkt med: brenneriveien_ingens_gate. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| lisbon_panteao_nacional | Panteão Nacional (Igreja de Santa Engrácia) | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json | 38.7155 | -9.1244 | 150 | Deler punkt med: lisbon_feira_da_ladra. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| lisbon_feira_da_ladra | Feira da Ladra | populaerkultur | data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json | 38.7155 | -9.1244 | 250 | Deler punkt med: lisbon_panteao_nacional. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| lisbon_cinema_sao_jorge | Cinema São Jorge | film_tv | data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json | 38.7202 | -9.1463 | 100 | Deler punkt med: lisbon_doclisboa. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| lisbon_doclisboa | Doclisboa – Festival Internacional de Cinema | film_tv | data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json | 38.7202 | -9.1463 | 250 | Deler punkt med: lisbon_cinema_sao_jorge. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| etnesjoen_torg_og_kai | Etnesjøen torg og kai | by | data/places/by/vestland/etne/etnesjoen_torg_og_kai.json | 59.66489494369154 | 5.934465720587056 | 260 | Deler punkt med: ingvar_moe_byste_etne. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| ingvar_moe_byste_etne | Ingvar Moe-bysten i Etne | litteratur | data/places/litteratur/vestland/etne/ingvar_moe_byste_etne.json | 59.66489494369154 | 5.934465720587056 | 120 | Deler punkt med: etnesjoen_torg_og_kai. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| etne_bmx_og_skatepark | Etne BMX- og skatepark | sport | data/places/sport/vestland/etne/etne_bmx_og_skatepark.json | 59.66795396985244 | 5.942168981207253 | 300 | Deler punkt med: etne_tennisanlegg. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| etne_tennisanlegg | Etne tennisanlegg | sport | data/places/sport/vestland/etne/etne_tennisanlegg.json | 59.66795396985244 | 5.942168981207253 | 220 | Deler punkt med: etne_bmx_og_skatepark. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |

### ligger svært langt fra de andre stedene i samme fil (117)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gamle_hvam_museum | Gamle Hvam museum | historie | data/places/historie/akershus/places_historie_akershus_batch2.json | 60.10201 | 11.38486 | 260 | Punktet ligger ~51 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hvaler_kirke | Hvaler kirke | historie | data/places/historie/ostfold/places_historie_ostfold_batch2.json | 59.0375 | 11.0319 | 240 | Punktet ligger ~50 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| fossesholm_herregard | Fossesholm Herregård | historie | data/places/historie/buskerud/places_historie_buskerud_batch1.json | 59.7346 | 9.8672 | 320 | Punktet ligger ~51 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| torpo_stavkirke | Torpo stavkirke | historie | data/places/historie/buskerud/places_historie_buskerud_batch2.json | 60.6667 | 8.7167 | 260 | Punktet ligger ~70 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hol_gamle_kyrkje | Hol gamle kyrkje | historie | data/places/historie/buskerud/places_historie_buskerud_batch2.json | 60.6158 | 8.2969 | 260 | Punktet ligger ~82 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| drammen_museum_marienlyst | Drammen Museum / Marienlyst | historie | data/places/historie/buskerud/places_historie_buskerud_batch2.json | 59.7389 | 10.2044 | 300 | Punktet ligger ~62 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| haug_kirke_eiker | Haug kirke / Eiker kirkested | historie | data/places/historie/buskerud/places_historie_buskerud_batch2.json | 59.7709 | 9.9045 | 260 | Punktet ligger ~50 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| lier_bygdetun | Lier Bygdetun | historie | data/places/historie/buskerud/places_historie_buskerud_batch2.json | 59.7862 | 10.2453 | 300 | Punktet ligger ~60 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| gulskogen_gard | Gulskogen gård | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 59.7336 | 10.1577 | 320 | Punktet ligger ~76 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| aal_bygdamuseum | Ål Bygdamuseum | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 60.6359 | 8.5627 | 320 | Punktet ligger ~63 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| gol_bygdemuseum | Gol Bygdemuseum | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 60.7012 | 8.9653 | 320 | Punktet ligger ~51 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hemsedal_bygdatun | Hemsedal Bygdatun / Øvre Løkji | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 60.8578 | 8.6409 | 320 | Punktet ligger ~76 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| krokkleiva_kongeveien | Krokkleiva / Den bergenske kongevei | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 60.0609 | 10.3092 | 420 | Punktet ligger ~52 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bragernes_kirke | Bragernes kirke | historie | data/places/historie/buskerud/places_historie_buskerud_batch5.json | 59.7463 | 10.2051 | 260 | Punktet ligger ~76 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| lom_stavkirke | Lom stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch1.json | 61.8372 | 8.5686 | 300 | Punktet ligger ~130 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kongsvinger_festning | Kongsvinger festning | historie | data/places/historie/innlandet/places_historie_innlandet_batch1.json | 60.1934 | 12.0039 | 420 | Punktet ligger ~131 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hegge_stavkirke | Hegge stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch2.json | 61.1235 | 9.0774 | 280 | Punktet ligger ~101 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| reinli_stavkirke | Reinli stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch2.json | 60.8377 | 9.4888 | 280 | Punktet ligger ~75 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| norsk_utvandrermuseum_ottestad | Norsk utvandrermuseum Ottestad | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 60.7731 | 11.1197 | 360 | Punktet ligger ~107 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| lesja_bygdemuseum | Lesja bygdemuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 62.1171 | 8.8618 | 320 | Punktet ligger ~85 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bagnsbergatn_krigsminne | Bagnsbergatn / krigsminne | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 60.8227 | 9.5492 | 360 | Punktet ligger ~83 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| tolga_os_museum | Tolga-Os museum / Dølmotunet | historie | data/places/historie/innlandet/places_historie_innlandet_batch3.json | 62.4083 | 10.9986 | 320 | Punktet ligger ~110 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| norsk_vegmuseum_oyer | Norsk vegmuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch4.json | 61.2234 | 10.4368 | 420 | Punktet ligger ~66 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| nybergsund_kongens_nei | Nybergsund / Kongens nei | historie | data/places/historie/innlandet/places_historie_innlandet_batch4.json | 61.2601 | 12.3266 | 360 | Punktet ligger ~105 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kvinnemuseet_kongsvinger | Kvinnemuseet Kongsvinger | historie | data/places/historie/innlandet/places_historie_innlandet_batch4.json | 60.1916 | 12.0061 | 280 | Punktet ligger ~83 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| oye_stavkirke | Øye stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch5.json | 61.1713 | 8.3996 | 280 | Punktet ligger ~72 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hedalen_stavkirke | Hedalen stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch5.json | 60.6484 | 9.7327 | 300 | Punktet ligger ~53 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| vaga_kyrkje | Vågå kyrkje | historie | data/places/historie/innlandet/places_historie_innlandet_batch5.json | 61.8751 | 9.0966 | 280 | Punktet ligger ~90 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| matrand_slagsted_1814 | Matrand / slagsted 1814 | historie | data/places/historie/innlandet/places_historie_innlandet_batch5.json | 60.0342 | 12.1298 | 420 | Punktet ligger ~178 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| finnetunet_skogfinsk_museum | Finnetunet / skogfinsk museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.4186 | 12.4019 | 360 | Punktet ligger ~108 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| sor_fron_kirke_gudbrandsdalsdomen | Sør-Fron kirke / Gudbrandsdalsdomen | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 61.5567 | 9.9407 | 300 | Punktet ligger ~78 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| lesja_kirke | Lesja kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 62.1176 | 8.8613 | 280 | Punktet ligger ~162 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| valdres_folkemuseum_fagernes | Valdres Folkemuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.9869 | 9.2356 | 420 | Punktet ligger ~83 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| odalstunet_sor_odal | Odalstunet | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.2521 | 11.6846 | 320 | Punktet ligger ~95 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| tynset_bygdemuseum | Tynset bygdemuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 62.2764 | 10.7821 | 320 | Punktet ligger ~143 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| eidskog_museum_almenninga | Eidskog museum / Almenninga | historie | data/places/historie/innlandet/places_historie_innlandet_batch6.json | 60.0347 | 12.1291 | 320 | Punktet ligger ~129 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| ringsaker_kirke | Ringsaker kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 60.8839 | 10.9486 | 280 | Punktet ligger ~108 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| dovre_kirke | Dovre kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 61.9858 | 9.2509 | 280 | Punktet ligger ~50 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| rendalen_bygdemuseum | Rendalen bygdemuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 61.7585 | 11.1905 | 320 | Punktet ligger ~58 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| skjaak_bygdamuseum | Skjåk bygdamuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 61.8837 | 8.2668 | 320 | Punktet ligger ~96 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| stenberg_toten_museum | Stenberg / Toten museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch7.json | 60.6818 | 10.6289 | 340 | Punktet ligger ~124 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| nordberg_fort | Nordberg fort | historie | data/places/historie/innlandet/places_historie_innlandet_batch8.json | 61.8959 | 8.2276 | 360 | Punktet ligger ~138 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| trysil_bygdetun | Trysil bygdetun | historie | data/places/historie/innlandet/places_historie_innlandet_batch8.json | 61.3092 | 12.2566 | 320 | Punktet ligger ~98 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| solor_museum_flisa | Solør museum / Flisa | historie | data/places/historie/innlandet/places_historie_innlandet_batch8.json | 60.6098 | 12.0118 | 320 | Punktet ligger ~110 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| grue_kirke_brannminne | Grue kirke / brannminne | historie | data/places/historie/innlandet/places_historie_innlandet_batch8.json | 60.4511 | 12.0639 | 300 | Punktet ligger ~124 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| lom_bygdamuseum_presthaugen | Lom bygdamuseum / Presthaugen | historie | data/places/historie/innlandet/places_historie_innlandet_batch8.json | 61.8376 | 8.5714 | 320 | Punktet ligger ~119 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| blokkodden_villmarksmuseum | Blokkodden Villmarksmuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 61.9694 | 11.9558 | 360 | Punktet ligger ~59 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| faaberg_kirke | Fåberg kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 61.1688 | 10.3789 | 280 | Punktet ligger ~72 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| vang_kirke_hamar | Vang kirke Hamar | historie | data/places/historie/innlandet/places_historie_innlandet_batch9.json | 60.8257 | 11.1325 | 280 | Punktet ligger ~106 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| brandval_kirke | Brandval kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch11.json | 60.3157 | 12.0144 | 280 | Punktet ligger ~103 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| follebu_kirke | Follebu kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch12.json | 61.2169 | 10.2922 | 280 | Punktet ligger ~81 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hoff_kirke_toten | Hoff kirke Østre Toten | historie | data/places/historie/innlandet/places_historie_innlandet_batch12.json | 60.6733 | 10.8187 | 280 | Punktet ligger ~147 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| nes_kirke_ringsaker | Nes kirke Ringsaker | historie | data/places/historie/innlandet/places_historie_innlandet_batch13.json | 60.7648 | 10.9427 | 280 | Punktet ligger ~57 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| ullinsvin_vagaa_prestegard | Ullinsvin / Vågå prestegard | historie | data/places/historie/innlandet/places_historie_innlandet_batch13.json | 61.8755 | 9.0951 | 300 | Punktet ligger ~102 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kvam_krigsminne_1940 | Kvam / krigsminne 1940 | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 61.6655 | 9.6904 | 360 | Punktet ligger ~81 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| asnes_kirke | Åsnes kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 60.6134 | 12.0112 | 280 | Punktet ligger ~124 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hof_kirke_asnes | Hof kirke Åsnes | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 60.5402 | 12.0804 | 280 | Punktet ligger ~133 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| tolga_kirke | Tolga kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 62.4091 | 10.9996 | 280 | Punktet ligger ~84 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| os_kirke_osterdalen | Os kirke Østerdalen | historie | data/places/historie/innlandet/places_historie_innlandet_batch15.json | 62.4962 | 11.2238 | 280 | Punktet ligger ~92 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| slidredomen_vestre_slidre | Slidredomen / Vestre Slidre kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 61.0887 | 8.9815 | 300 | Punktet ligger ~103 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bruflat_kirke_etnedal | Bruflat kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 60.8878 | 9.6428 | 280 | Punktet ligger ~64 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| vinger_kirke_kongsvinger | Vinger kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 60.1905 | 12.0042 | 280 | Punktet ligger ~99 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| grue_finnskog_kirke | Grue Finnskog kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 60.4362 | 12.4486 | 280 | Punktet ligger ~100 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| alvdal_kirke | Alvdal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17.json | 62.1081 | 10.6302 | 280 | Punktet ligger ~139 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kvikne_kirke | Kvikne kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch18.json | 62.5764 | 10.2184 | 280 | Punktet ligger ~116 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| dombas_krigsminne_1940 | Dombås / krigsminne 1940 | historie | data/places/historie/innlandet/places_historie_innlandet_batch18.json | 62.0694 | 9.1242 | 360 | Punktet ligger ~83 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| eidsborg_stavkirke | Eidsborg stavkirke | historie | data/places/historie/telemark/places_historie_telemark_batch1.json | 59.4648 | 8.0244 | 320 | Punktet ligger ~73 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| vest_telemark_museum_eidsborg | Vest-Telemark Museum Eidsborg | historie | data/places/historie/telemark/places_historie_telemark_batch3.json | 59.4656 | 8.0233 | 360 | Punktet ligger ~95 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| gunnarsholmen_kystfort_kragero | Gunnarsholmen kystfort Kragerø | historie | data/places/historie/telemark/places_historie_telemark_batch7.json | 58.8676 | 9.4148 | 300 | Punktet ligger ~79 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| tinn_museum_austbygde | Tinn Museum Austbygde | historie | data/places/historie/telemark/places_historie_telemark_batch7.json | 59.9953 | 8.8235 | 360 | Punktet ligger ~56 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| atra_kirke_tinn | Atrå kirke | historie | data/places/historie/telemark/places_historie_telemark_batch7.json | 59.9908 | 8.744 | 280 | Punktet ligger ~56 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
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
| stein_ringerike_halvdanshaugen | Stein på Ringerike / Halvdanshaugen | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 60.10125 | 10.29613 | 260 | Punktet ligger ~156 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| fitjar_hakonarparken | Håkonarparken på Fitjar | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 59.91731 | 5.31801 | 160 | Punktet ligger ~322 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hjorungavag | Hjørungavåg | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 62.3426 | 6.0725 | 420 | Punktet ligger ~239 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| rimol_melhus | Rimol i Melhus | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 63.2869 | 10.2707 | 200 | Punktet ligger ~199 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bjarkoy_tore_hund | Tore Hunds naust og monument på Bjarkøy | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 68.99776 | 16.53797 | 220 | Punktet ligger ~882 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| egge_gard_steinkjer | Egge gård og Egge museum | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 64.021678 | 11.463289 | 260 | Punktet ligger ~287 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| giske_kyrkje | Giske kyrkje og Giskeætta | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 62.49864 | 6.05026 | 170 | Punktet ligger ~247 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hallvardskirken_oslo | Hallvardskirken i middelalder-Oslo | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 59.9065 | 10.7644 | 90 | Punktet ligger ~179 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| munkeliv_kloster | Munkeliv kloster på Nordnes | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 60.39502 | 5.31554 | 100 | Punktet ligger ~294 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| audunborg_hegrenes | Audunborg på Hegrenes | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 61.5008 | 6.2582 | 220 | Punktet ligger ~213 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| varteig_kirke | Varteig kirke og Inga fra Varteig-landskapet | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 59.35034 | 11.18966 | 220 | Punktet ligger ~244 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| elgeseter_kloster | Elgeseter kloster i Klostergata | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 63.42111 | 10.39401 | 180 | Punktet ligger ~214 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| talgje_kyrkje | Talgje kyrkje og Talgje-godset | historie | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | 59.10627 | 5.84153 | 170 | Punktet ligger ~361 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| nidaros_erkebispegarden | Erkebispegården i Nidaros | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 63.42683 | 10.39596 | 110 | Punktet ligger ~340 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kristkirken_bergenhus | Kristkirken på Bergenhus | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 60.40042 | 5.31827 | 90 | Punktet ligger ~254 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| hakonshella_bauta | Håkonshella og Håkon den gode-bautaen | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 60.34567 | 5.18007 | 230 | Punktet ligger ~262 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kalvskinnet_slagsted | Kalvskinnet slagsted | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 63.4292 | 10.3873 | 260 | Punktet ligger ~341 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| fimreite_slagsted | Fimreite slagsted | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 61.1546 | 6.9884 | 520 | Punktet ligger ~183 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| sekken_slagsted | Sekken slagsted og minnestein | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 62.647 | 7.3678 | 320 | Punktet ligger ~287 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| re_slagsted_ramnes | Re slagsted ved Ramnes | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 59.3501 | 10.2369 | 300 | Punktet ligger ~115 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bratsberg_gard | Bratsberg gård | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 59.1742 | 9.6602 | 180 | Punktet ligger ~134 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| bohus_festning_bagaholmen | Bohus festning på Bagaholmen | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 57.8628 | 11.9987 | 180 | Punktet ligger ~303 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| kalmar_slott | Kalmar slott | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | 56.6616 | 16.3568 | 180 | Punktet ligger ~555 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| downpatrick_magnus_berrfott | Downpatrick og Magnus Berrføtt | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 54.3278 | -5.7159 | 400 | Punktet ligger ~345 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| holmengra_hvaler | Holmengrå ved Hvaler | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 59.027 | 11.045 | 650 | Punktet ligger ~802 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| stamford_bridge_battlefield | Stamford Bridge battlefield | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 53.989 | -0.903 | 650 | Punktet ligger ~196 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| jelling_kongsgard | Jelling kongsgård og monumentområde | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 55.756 | 9.419 | 320 | Punktet ligger ~645 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
| orkney_birsay | Brough of Birsay / Orknøyene | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | 59.136 | -3.322 | 420 | Punktet ligger ~403 km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet. |
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
