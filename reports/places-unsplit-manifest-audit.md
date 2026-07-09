# Places manifest split audit

Generated at: 2026-07-09T18:57:13.129Z

## Summary

- Manifest entries checked: 285
- JSON array entries: 285
- JSON object/scalar entries: 0
- Array entries with split manifest: 97
- Array entries missing split manifest: 188
- Actual multi-place arrays missing split manifest: 0
- Single-place arrays without split manifest: 188
- Missing source files: 0
- Parse errors: 0

## Actual multi-place arrays missing split manifest

_None._

## Single-place arrays without split manifest

These are already one manifest entry per place, but the file body is still a one-element JSON array rather than a plain object or a split-manifest directory.

| Source | Places | First place id | Expected split manifest |
| --- | ---: | --- | --- |
| `data/places/by/agder/arendal_stasjon.json` | 1 | `arendal_stasjon` | `data/places/by/agder/arendal_stasjon_manifest.json` |
| `data/places/by/agder/arendal_tollbod.json` | 1 | `arendal_tollbod` | `data/places/by/agder/arendal_tollbod_manifest.json` |
| `data/places/by/agder/audnedal_stasjon_lyngdal.json` | 1 | `audnedal_stasjon_lyngdal` | `data/places/by/agder/audnedal_stasjon_lyngdal_manifest.json` |
| `data/places/by/agder/dampskipet_bjoren_bygland.json` | 1 | `dampskipet_bjoren_bygland` | `data/places/by/agder/dampskipet_bjoren_bygland_manifest.json` |
| `data/places/by/agder/farsund_byhistorie_havn.json` | 1 | `farsund_byhistorie_havn` | `data/places/by/agder/farsund_byhistorie_havn_manifest.json` |
| `data/places/by/agder/fiskebrygga_kristiansand.json` | 1 | `fiskebrygga_kristiansand` | `data/places/by/agder/fiskebrygga_kristiansand_manifest.json` |
| `data/places/by/agder/flekkefjord_hollenderbyen.json` | 1 | `flekkefjord_hollenderbyen` | `data/places/by/agder/flekkefjord_hollenderbyen_manifest.json` |
| `data/places/by/agder/flekkefjordbanen_sira.json` | 1 | `flekkefjordbanen_sira` | `data/places/by/agder/flekkefjordbanen_sira_manifest.json` |
| `data/places/by/agder/fullriggeren_sorlandet_kristiansand.json` | 1 | `fullriggeren_sorlandet_kristiansand` | `data/places/by/agder/fullriggeren_sorlandet_kristiansand_manifest.json` |
| `data/places/by/agder/grimstad_byhistorie_og_havn.json` | 1 | `grimstad_byhistorie_og_havn` | `data/places/by/agder/grimstad_byhistorie_og_havn_manifest.json` |
| `data/places/by/agder/grimstad_stasjon_grimstadbanen.json` | 1 | `grimstad_stasjon_grimstadbanen` | `data/places/by/agder/grimstad_stasjon_grimstadbanen_manifest.json` |
| `data/places/by/agder/gronningen_fyr_kristiansand.json` | 1 | `gronningen_fyr_kristiansand` | `data/places/by/agder/gronningen_fyr_kristiansand_manifest.json` |
| `data/places/by/agder/hollen_brygge_sogne.json` | 1 | `hollen_brygge_sogne` | `data/places/by/agder/hollen_brygge_sogne_manifest.json` |
| `data/places/by/agder/homborsund_fyr_grimstad.json` | 1 | `homborsund_fyr_grimstad` | `data/places/by/agder/homborsund_fyr_grimstad_manifest.json` |
| `data/places/by/agder/kristiansand_gamle_tollbod.json` | 1 | `kristiansand_gamle_tollbod` | `data/places/by/agder/kristiansand_gamle_tollbod_manifest.json` |
| `data/places/by/agder/kristiansand_lufthavn_kjevik.json` | 1 | `kristiansand_lufthavn_kjevik` | `data/places/by/agder/kristiansand_lufthavn_kjevik_manifest.json` |
| `data/places/by/agder/kristiansand_stasjon.json` | 1 | `kristiansand_stasjon` | `data/places/by/agder/kristiansand_stasjon_manifest.json` |
| `data/places/by/agder/lillesand_byhistorie_og_havn.json` | 1 | `lillesand_byhistorie_og_havn` | `data/places/by/agder/lillesand_byhistorie_og_havn_manifest.json` |
| `data/places/by/agder/lillesand_flaksvandbanen.json` | 1 | `lillesand_flaksvandbanen` | `data/places/by/agder/lillesand_flaksvandbanen_manifest.json` |
| `data/places/by/agder/lindesnes_fyr.json` | 1 | `lindesnes_fyr` | `data/places/by/agder/lindesnes_fyr_manifest.json` |
| `data/places/by/agder/lista_flystasjon_farsund.json` | 1 | `lista_flystasjon_farsund` | `data/places/by/agder/lista_flystasjon_farsund_manifest.json` |
| `data/places/by/agder/lista_fyr.json` | 1 | `lista_fyr` | `data/places/by/agder/lista_fyr_manifest.json` |
| `data/places/by/agder/lyngor_uthavn_tvedestrand.json` | 1 | `lyngor_uthavn_tvedestrand` | `data/places/by/agder/lyngor_uthavn_tvedestrand_manifest.json` |
| `data/places/by/agder/merdo_uthavn_arendal.json` | 1 | `merdo_uthavn_arendal` | `data/places/by/agder/merdo_uthavn_arendal_manifest.json` |
| `data/places/by/agder/nelaug_stasjon_amli.json` | 1 | `nelaug_stasjon_amli` | `data/places/by/agder/nelaug_stasjon_amli_manifest.json` |
| `data/places/by/agder/ny_hellesund_uthavn_sogne.json` | 1 | `ny_hellesund_uthavn_sogne` | `data/places/by/agder/ny_hellesund_uthavn_sogne_manifest.json` |
| `data/places/by/agder/oksoy_fyr_kristiansand.json` | 1 | `oksoy_fyr_kristiansand` | `data/places/by/agder/oksoy_fyr_kristiansand_manifest.json` |
| `data/places/by/agder/posebyen_kristiansand_trehusby.json` | 1 | `posebyen_kristiansand_trehusby` | `data/places/by/agder/posebyen_kristiansand_trehusby_manifest.json` |
| `data/places/by/agder/risor_trehusby_byhistorie.json` | 1 | `risor_trehusby_byhistorie` | `data/places/by/agder/risor_trehusby_byhistorie_manifest.json` |
| `data/places/by/agder/ryvingen_fyr_mandal.json` | 1 | `ryvingen_fyr_mandal` | `data/places/by/agder/ryvingen_fyr_mandal_manifest.json` |
| `data/places/by/agder/setesdalsbanen_grovane.json` | 1 | `setesdalsbanen_grovane` | `data/places/by/agder/setesdalsbanen_grovane_manifest.json` |
| `data/places/by/agder/spangereidkanalen_lindesnes.json` | 1 | `spangereidkanalen_lindesnes` | `data/places/by/agder/spangereidkanalen_lindesnes_manifest.json` |
| `data/places/by/agder/torungen_fyr_arendal.json` | 1 | `torungen_fyr_arendal` | `data/places/by/agder/torungen_fyr_arendal_manifest.json` |
| `data/places/by/agder/tvedestrand_byhistorie_og_havn.json` | 1 | `tvedestrand_byhistorie_og_havn` | `data/places/by/agder/tvedestrand_byhistorie_og_havn_manifest.json` |
| `data/places/by/agder/tyholmen_arendal_byhistorie.json` | 1 | `tyholmen_arendal_byhistorie` | `data/places/by/agder/tyholmen_arendal_byhistorie_manifest.json` |
| `data/places/by/innlandet/hamar_stasjon_jernbanebyen.json` | 1 | `hamar_stasjon_jernbanebyen` | `data/places/by/innlandet/hamar_stasjon_jernbanebyen_manifest.json` |
| `data/places/by/innlandet/skibladner_gjovik.json` | 1 | `skibladner_gjovik` | `data/places/by/innlandet/skibladner_gjovik_manifest.json` |
| `data/places/by/telemark/bo_stasjon_sorlandsbanen.json` | 1 | `bo_stasjon_sorlandsbanen` | `data/places/by/telemark/bo_stasjon_sorlandsbanen_manifest.json` |
| `data/places/by/telemark/brevik_byhistorie_tollbod.json` | 1 | `brevik_byhistorie_tollbod` | `data/places/by/telemark/brevik_byhistorie_tollbod_manifest.json` |
| `data/places/by/telemark/df_ammonia_mael.json` | 1 | `df_ammonia_mael` | `data/places/by/telemark/df_ammonia_mael_manifest.json` |
| `data/places/by/telemark/hogga_sluse_telemarkskanalen.json` | 1 | `hogga_sluse_telemarkskanalen` | `data/places/by/telemark/hogga_sluse_telemarkskanalen_manifest.json` |
| `data/places/by/telemark/kjeldal_sluse_telemarkskanalen.json` | 1 | `kjeldal_sluse_telemarkskanalen` | `data/places/by/telemark/kjeldal_sluse_telemarkskanalen_manifest.json` |
| `data/places/by/telemark/kragero_stasjon_kragerobanen.json` | 1 | `kragero_stasjon_kragerobanen` | `data/places/by/telemark/kragero_stasjon_kragerobanen_manifest.json` |
| `data/places/by/telemark/lunde_sluse_telemarkskanalen.json` | 1 | `lunde_sluse_telemarkskanalen` | `data/places/by/telemark/lunde_sluse_telemarkskanalen_manifest.json` |
| `data/places/by/telemark/mael_stasjon_rjukanbanen.json` | 1 | `mael_stasjon_rjukanbanen` | `data/places/by/telemark/mael_stasjon_rjukanbanen_manifest.json` |
| `data/places/by/telemark/notodden_stasjon_industriarv.json` | 1 | `notodden_stasjon_industriarv` | `data/places/by/telemark/notodden_stasjon_industriarv_manifest.json` |
| `data/places/by/telemark/rjukanbanen_rjukan_stasjon.json` | 1 | `rjukanbanen_rjukan_stasjon` | `data/places/by/telemark/rjukanbanen_rjukan_stasjon_manifest.json` |
| `data/places/by/telemark/telemarkskanalen_vrangfoss.json` | 1 | `telemarkskanalen_vrangfoss` | `data/places/by/telemark/telemarkskanalen_vrangfoss_manifest.json` |
| `data/places/by/telemark/tinnoset_stasjon_tinnosbanen.json` | 1 | `tinnoset_stasjon_tinnosbanen` | `data/places/by/telemark/tinnoset_stasjon_tinnosbanen_manifest.json` |
| `data/places/by/telemark/treungen_stasjon_treungenbanen.json` | 1 | `treungen_stasjon_treungenbanen` | `data/places/by/telemark/treungen_stasjon_treungenbanen_manifest.json` |
| `data/places/by/vestfold/faerder_fyr.json` | 1 | `faerder_fyr` | `data/places/by/vestfold/faerder_fyr_manifest.json` |
| `data/places/by/vestfold/horten_stasjon_vestfoldbanen.json` | 1 | `horten_stasjon_vestfoldbanen` | `data/places/by/vestfold/horten_stasjon_vestfoldbanen_manifest.json` |
| `data/places/by/vestfold/larvik_stasjon_vestfoldbanen.json` | 1 | `larvik_stasjon_vestfoldbanen` | `data/places/by/vestfold/larvik_stasjon_vestfoldbanen_manifest.json` |
| `data/places/by/vestfold/sandefjord_kurbad.json` | 1 | `sandefjord_kurbad` | `data/places/by/vestfold/sandefjord_kurbad_manifest.json` |
| `data/places/by/vestfold/sandefjord_stasjon_vestfoldbanen.json` | 1 | `sandefjord_stasjon_vestfoldbanen` | `data/places/by/vestfold/sandefjord_stasjon_vestfoldbanen_manifest.json` |
| `data/places/by/vestfold/tollerodden_larvik.json` | 1 | `tollerodden_larvik` | `data/places/by/vestfold/tollerodden_larvik_manifest.json` |
| `data/places/by/vestfold/tonsberg_stasjon_vestfoldbanen.json` | 1 | `tonsberg_stasjon_vestfoldbanen` | `data/places/by/vestfold/tonsberg_stasjon_vestfoldbanen_manifest.json` |
| `data/places/historie/agder/amli_kirke.json` | 1 | `amli_kirke` | `data/places/historie/agder/amli_kirke_manifest.json` |
| `data/places/historie/agder/arendal_gamle_radhus.json` | 1 | `arendal_gamle_radhus` | `data/places/historie/agder/arendal_gamle_radhus_manifest.json` |
| `data/places/historie/agder/arendal_sjofartsmuseum.json` | 1 | `arendal_sjofartsmuseum` | `data/places/historie/agder/arendal_sjofartsmuseum_manifest.json` |
| `data/places/historie/agder/austre_moland_kirke_arendal.json` | 1 | `austre_moland_kirke_arendal` | `data/places/historie/agder/austre_moland_kirke_arendal_manifest.json` |
| `data/places/historie/agder/bakke_kirke_flekkefjord.json` | 1 | `bakke_kirke_flekkefjord` | `data/places/historie/agder/bakke_kirke_flekkefjord_manifest.json` |
| `data/places/historie/agder/birkenes_kirke.json` | 1 | `birkenes_kirke` | `data/places/historie/agder/birkenes_kirke_manifest.json` |
| `data/places/historie/agder/boen_gard_kristiansand.json` | 1 | `boen_gard_kristiansand` | `data/places/historie/agder/boen_gard_kristiansand_manifest.json` |
| `data/places/historie/agder/bygland_museum.json` | 1 | `bygland_museum` | `data/places/historie/agder/bygland_museum_manifest.json` |
| `data/places/historie/agder/byremo_tingsted_lyngdal.json` | 1 | `byremo_tingsted_lyngdal` | `data/places/historie/agder/byremo_tingsted_lyngdal_manifest.json` |
| `data/places/historie/agder/ds_hestmanden_kristiansand.json` | 1 | `ds_hestmanden_kristiansand` | `data/places/historie/agder/ds_hestmanden_kristiansand_manifest.json` |
| `data/places/historie/agder/dypvag_kirke_tvedestrand.json` | 1 | `dypvag_kirke_tvedestrand` | `data/places/historie/agder/dypvag_kirke_tvedestrand_manifest.json` |
| `data/places/historie/agder/eide_kirke_grimstad.json` | 1 | `eide_kirke_grimstad` | `data/places/historie/agder/eide_kirke_grimstad_manifest.json` |
| `data/places/historie/agder/eiken_kirke_haegebostad.json` | 1 | `eiken_kirke_haegebostad` | `data/places/historie/agder/eiken_kirke_haegebostad_manifest.json` |
| `data/places/historie/agder/evjemoen_leir_evje.json` | 1 | `evjemoen_leir_evje` | `data/places/historie/agder/evjemoen_leir_evje_manifest.json` |
| `data/places/historie/agder/farsund_kirke_byhistorie.json` | 1 | `farsund_kirke_byhistorie` | `data/places/historie/agder/farsund_kirke_byhistorie_manifest.json` |
| `data/places/historie/agder/feda_kirke_kvinesdal.json` | 1 | `feda_kirke_kvinesdal` | `data/places/historie/agder/feda_kirke_kvinesdal_manifest.json` |
| `data/places/historie/agder/flekkefjord_kirke_byhistorie.json` | 1 | `flekkefjord_kirke_byhistorie` | `data/places/historie/agder/flekkefjord_kirke_byhistorie_manifest.json` |
| `data/places/historie/agder/flekkefjord_museum.json` | 1 | `flekkefjord_museum` | `data/places/historie/agder/flekkefjord_museum_manifest.json` |
| `data/places/historie/agder/flosta_kirke_arendal.json` | 1 | `flosta_kirke_arendal` | `data/places/historie/agder/flosta_kirke_arendal_manifest.json` |
| `data/places/historie/agder/gimle_gard_kristiansand.json` | 1 | `gimle_gard_kristiansand` | `data/places/historie/agder/gimle_gard_kristiansand_manifest.json` |
| `data/places/historie/agder/gjerstad_kirke.json` | 1 | `gjerstad_kirke` | `data/places/historie/agder/gjerstad_kirke_manifest.json` |
| `data/places/historie/agder/grimstad_kirke_byhistorie.json` | 1 | `grimstad_kirke_byhistorie` | `data/places/historie/agder/grimstad_kirke_byhistorie_manifest.json` |
| `data/places/historie/agder/haegebostad_kirke.json` | 1 | `haegebostad_kirke` | `data/places/historie/agder/haegebostad_kirke_manifest.json` |
| `data/places/historie/agder/herefoss_kirke_birkenes.json` | 1 | `herefoss_kirke_birkenes` | `data/places/historie/agder/herefoss_kirke_birkenes_manifest.json` |
| `data/places/historie/agder/hidra_kirke_flekkefjord.json` | 1 | `hidra_kirke_flekkefjord` | `data/places/historie/agder/hidra_kirke_flekkefjord_manifest.json` |
| `data/places/historie/agder/holt_kirke_tvedestrand.json` | 1 | `holt_kirke_tvedestrand` | `data/places/historie/agder/holt_kirke_tvedestrand_manifest.json` |
| `data/places/historie/agder/hornnes_kirke.json` | 1 | `hornnes_kirke` | `data/places/historie/agder/hornnes_kirke_manifest.json` |
| `data/places/historie/agder/hovag_kirke_lillesand.json` | 1 | `hovag_kirke_lillesand` | `data/places/historie/agder/hovag_kirke_lillesand_manifest.json` |
| `data/places/historie/agder/hylestad_gamle_kyrkjegard.json` | 1 | `hylestad_gamle_kyrkjegard` | `data/places/historie/agder/hylestad_gamle_kyrkjegard_manifest.json` |
| `data/places/historie/agder/iveland_kirke.json` | 1 | `iveland_kirke` | `data/places/historie/agder/iveland_kirke_manifest.json` |
| `data/places/historie/agder/konsmo_kirke_lyngdal.json` | 1 | `konsmo_kirke_lyngdal` | `data/places/historie/agder/konsmo_kirke_lyngdal_manifest.json` |
| `data/places/historie/agder/kristiansand_kanonmuseum_movik.json` | 1 | `kristiansand_kanonmuseum_movik` | `data/places/historie/agder/kristiansand_kanonmuseum_movik_manifest.json` |
| `data/places/historie/agder/kvinesdal_kirke.json` | 1 | `kvinesdal_kirke` | `data/places/historie/agder/kvinesdal_kirke_manifest.json` |
| `data/places/historie/agder/landvik_kirke_grimstad.json` | 1 | `landvik_kirke_grimstad` | `data/places/historie/agder/landvik_kirke_grimstad_manifest.json` |
| `data/places/historie/agder/lillesand_by_og_sjofartsmuseum.json` | 1 | `lillesand_by_og_sjofartsmuseum` | `data/places/historie/agder/lillesand_by_og_sjofartsmuseum_manifest.json` |
| `data/places/historie/agder/lindesnes_bygdemuseum.json` | 1 | `lindesnes_bygdemuseum` | `data/places/historie/agder/lindesnes_bygdemuseum_manifest.json` |
| `data/places/historie/agder/lista_museum_vanse.json` | 1 | `lista_museum_vanse` | `data/places/historie/agder/lista_museum_vanse_manifest.json` |
| `data/places/historie/agder/lund_batteri_kristiansand.json` | 1 | `lund_batteri_kristiansand` | `data/places/historie/agder/lund_batteri_kristiansand_manifest.json` |
| `data/places/historie/agder/lyngdal_kirke.json` | 1 | `lyngdal_kirke` | `data/places/historie/agder/lyngdal_kirke_manifest.json` |
| `data/places/historie/agder/mandal_museum_andorsengarden.json` | 1 | `mandal_museum_andorsengarden` | `data/places/historie/agder/mandal_museum_andorsengarden_manifest.json` |
| `data/places/historie/agder/mykland_kirke_froland.json` | 1 | `mykland_kirke_froland` | `data/places/historie/agder/mykland_kirke_froland_manifest.json` |
| `data/places/historie/agder/nordberg_fort_lista.json` | 1 | `nordberg_fort_lista` | `data/places/historie/agder/nordberg_fort_lista_manifest.json` |
| `data/places/historie/agder/oddernes_kirke_kristiansand.json` | 1 | `oddernes_kirke_kristiansand` | `data/places/historie/agder/oddernes_kirke_kristiansand_manifest.json` |
| `data/places/historie/agder/odderoya_militaerhistorie_kristiansand.json` | 1 | `odderoya_militaerhistorie_kristiansand` | `data/places/historie/agder/odderoya_militaerhistorie_kristiansand_manifest.json` |
| `data/places/historie/agder/oyestad_kirke_arendal.json` | 1 | `oyestad_kirke_arendal` | `data/places/historie/agder/oyestad_kirke_arendal_manifest.json` |
| `data/places/historie/agder/risor_kirke_byhistorie.json` | 1 | `risor_kirke_byhistorie` | `data/places/historie/agder/risor_kirke_byhistorie_manifest.json` |
| `data/places/historie/agder/risor_museum.json` | 1 | `risor_museum` | `data/places/historie/agder/risor_museum_manifest.json` |
| `data/places/historie/agder/rygnestadtunet_valle.json` | 1 | `rygnestadtunet_valle` | `data/places/historie/agder/rygnestadtunet_valle_manifest.json` |
| `data/places/historie/agder/sogne_gamle_kirke_kristiansand.json` | 1 | `sogne_gamle_kirke_kristiansand` | `data/places/historie/agder/sogne_gamle_kirke_kristiansand_manifest.json` |
| `data/places/historie/agder/sogne_gamle_prestegard.json` | 1 | `sogne_gamle_prestegard` | `data/places/historie/agder/sogne_gamle_prestegard_manifest.json` |
| `data/places/historie/agder/sondeled_kirke_risor.json` | 1 | `sondeled_kirke_risor` | `data/places/historie/agder/sondeled_kirke_risor_manifest.json` |
| `data/places/historie/agder/spangereid_kirke_lindesnes.json` | 1 | `spangereid_kirke_lindesnes` | `data/places/historie/agder/spangereid_kirke_lindesnes_manifest.json` |
| `data/places/historie/agder/stiftelsen_arkivet_kristiansand.json` | 1 | `stiftelsen_arkivet_kristiansand` | `data/places/historie/agder/stiftelsen_arkivet_kristiansand_manifest.json` |
| `data/places/historie/agder/tingvatn_fornminnepark_haegebostad.json` | 1 | `tingvatn_fornminnepark_haegebostad` | `data/places/historie/agder/tingvatn_fornminnepark_haegebostad_manifest.json` |
| `data/places/historie/agder/tonstad_kirke_sirdal.json` | 1 | `tonstad_kirke_sirdal` | `data/places/historie/agder/tonstad_kirke_sirdal_manifest.json` |
| `data/places/historie/agder/trefoldighetskirken_arendal.json` | 1 | `trefoldighetskirken_arendal` | `data/places/historie/agder/trefoldighetskirken_arendal_manifest.json` |
| `data/places/historie/agder/tromoy_kirke_arendal.json` | 1 | `tromoy_kirke_arendal` | `data/places/historie/agder/tromoy_kirke_arendal_manifest.json` |
| `data/places/historie/agder/valle_kyrkje_setesdal.json` | 1 | `valle_kyrkje_setesdal` | `data/places/historie/agder/valle_kyrkje_setesdal_manifest.json` |
| `data/places/historie/agder/vanse_kirke_farsund.json` | 1 | `vanse_kirke_farsund` | `data/places/historie/agder/vanse_kirke_farsund_manifest.json` |
| `data/places/historie/agder/vegarshei_kirke.json` | 1 | `vegarshei_kirke` | `data/places/historie/agder/vegarshei_kirke_manifest.json` |
| `data/places/historie/agder/vest_agder_museet_kongsgard.json` | 1 | `vest_agder_museet_kongsgard` | `data/places/historie/agder/vest_agder_museet_kongsgard_manifest.json` |
| `data/places/historie/agder/vestre_moland_kirke_lillesand.json` | 1 | `vestre_moland_kirke_lillesand` | `data/places/historie/agder/vestre_moland_kirke_lillesand_manifest.json` |
| `data/places/historie/agder/vigeland_hovedgard_lindesnes.json` | 1 | `vigeland_hovedgard_lindesnes` | `data/places/historie/agder/vigeland_hovedgard_lindesnes_manifest.json` |
| `data/places/kunst/agder/arendal_kulturhus.json` | 1 | `arendal_kulturhus` | `data/places/kunst/agder/arendal_kulturhus_manifest.json` |
| `data/places/kunst/agder/kilden_teater_konserthus_kristiansand.json` | 1 | `kilden_teater_konserthus_kristiansand` | `data/places/kunst/agder/kilden_teater_konserthus_kristiansand_manifest.json` |
| `data/places/kunst/agder/valle_sylvsmie_handverkshistorie.json` | 1 | `valle_sylvsmie_handverkshistorie` | `data/places/kunst/agder/valle_sylvsmie_handverkshistorie_manifest.json` |
| `data/places/litteratur/agder/ibsen_museet_grimstad.json` | 1 | `ibsen_museet_grimstad` | `data/places/litteratur/agder/ibsen_museet_grimstad_manifest.json` |
| `data/places/litteratur/innlandet/aulestad_bjornson.json` | 1 | `aulestad_bjornson` | `data/places/litteratur/innlandet/aulestad_bjornson_manifest.json` |
| `data/places/litteratur/innlandet/bjerkebaek_undset.json` | 1 | `bjerkebaek_undset` | `data/places/litteratur/innlandet/bjerkebaek_undset_manifest.json` |
| `data/places/litteratur/innlandet/proysenstua_rudshogda.json` | 1 | `proysenstua_rudshogda` | `data/places/litteratur/innlandet/proysenstua_rudshogda_manifest.json` |
| `data/places/litteratur/telemark/ibsen_venstop_skien.json` | 1 | `ibsen_venstop_skien` | `data/places/litteratur/telemark/ibsen_venstop_skien_manifest.json` |
| `data/places/naeringsliv/agder/bomuldsfabriken_arendal.json` | 1 | `bomuldsfabriken_arendal` | `data/places/naeringsliv/agder/bomuldsfabriken_arendal_manifest.json` |
| `data/places/naeringsliv/agder/boylefoss_kraftverk_froland.json` | 1 | `boylefoss_kraftverk_froland` | `data/places/naeringsliv/agder/boylefoss_kraftverk_froland_manifest.json` |
| `data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand.json` | 1 | `bredalsholmen_dokk_kristiansand` | `data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand_manifest.json` |
| `data/places/naeringsliv/agder/brokke_kraftverk_valle.json` | 1 | `brokke_kraftverk_valle` | `data/places/naeringsliv/agder/brokke_kraftverk_valle_manifest.json` |
| `data/places/naeringsliv/agder/egeland_verk_gjerstad.json` | 1 | `egeland_verk_gjerstad` | `data/places/naeringsliv/agder/egeland_verk_gjerstad_manifest.json` |
| `data/places/naeringsliv/agder/flot_gruve_evje.json` | 1 | `flot_gruve_evje` | `data/places/naeringsliv/agder/flot_gruve_evje_manifest.json` |
| `data/places/naeringsliv/agder/froland_verk.json` | 1 | `froland_verk` | `data/places/naeringsliv/agder/froland_verk_manifest.json` |
| `data/places/naeringsliv/agder/holen_kraftverk_bykle.json` | 1 | `holen_kraftverk_bykle` | `data/places/naeringsliv/agder/holen_kraftverk_bykle_manifest.json` |
| `data/places/naeringsliv/agder/hunsfos_fabrikker_vennesla.json` | 1 | `hunsfos_fabrikker_vennesla` | `data/places/naeringsliv/agder/hunsfos_fabrikker_vennesla_manifest.json` |
| `data/places/naeringsliv/agder/knaben_gruver_kvinesdal.json` | 1 | `knaben_gruver_kvinesdal` | `data/places/naeringsliv/agder/knaben_gruver_kvinesdal_manifest.json` |
| `data/places/naeringsliv/agder/laudal_kraftverk_lindesnes.json` | 1 | `laudal_kraftverk_lindesnes` | `data/places/naeringsliv/agder/laudal_kraftverk_lindesnes_manifest.json` |
| `data/places/naeringsliv/agder/nes_jernverk_tvedestrand.json` | 1 | `nes_jernverk_tvedestrand` | `data/places/naeringsliv/agder/nes_jernverk_tvedestrand_manifest.json` |
| `data/places/naeringsliv/agder/pusnes_mekaniske_verksted_arendal.json` | 1 | `pusnes_mekaniske_verksted_arendal` | `data/places/naeringsliv/agder/pusnes_mekaniske_verksted_arendal_manifest.json` |
| `data/places/naeringsliv/agder/sjolingstad_ullvarefabrikk.json` | 1 | `sjolingstad_ullvarefabrikk` | `data/places/naeringsliv/agder/sjolingstad_ullvarefabrikk_manifest.json` |
| `data/places/naeringsliv/agder/tonstad_kraftverk_sirdal.json` | 1 | `tonstad_kraftverk_sirdal` | `data/places/naeringsliv/agder/tonstad_kraftverk_sirdal_manifest.json` |
| `data/places/naeringsliv/innlandet/atlungstad_brenneri.json` | 1 | `atlungstad_brenneri` | `data/places/naeringsliv/innlandet/atlungstad_brenneri_manifest.json` |
| `data/places/naeringsliv/innlandet/brumunddal_molle_industri.json` | 1 | `brumunddal_molle_industri` | `data/places/naeringsliv/innlandet/brumunddal_molle_industri_manifest.json` |
| `data/places/naeringsliv/innlandet/femundshytten_smeltverk.json` | 1 | `femundshytten_smeltverk` | `data/places/naeringsliv/innlandet/femundshytten_smeltverk_manifest.json` |
| `data/places/naeringsliv/innlandet/folldal_gruver.json` | 1 | `folldal_gruver` | `data/places/naeringsliv/innlandet/folldal_gruver_manifest.json` |
| `data/places/naeringsliv/innlandet/kapp_melkefabrikk.json` | 1 | `kapp_melkefabrikk` | `data/places/naeringsliv/innlandet/kapp_melkefabrikk_manifest.json` |
| `data/places/naeringsliv/innlandet/kistefos_tresliperi_jevnaker.json` | 1 | `kistefos_tresliperi_jevnaker` | `data/places/naeringsliv/innlandet/kistefos_tresliperi_jevnaker_manifest.json` |
| `data/places/naeringsliv/innlandet/klevfos_cellulose.json` | 1 | `klevfos_cellulose` | `data/places/naeringsliv/innlandet/klevfos_cellulose_manifest.json` |
| `data/places/naeringsliv/innlandet/kvikne_kobberverk.json` | 1 | `kvikne_kobberverk` | `data/places/naeringsliv/innlandet/kvikne_kobberverk_manifest.json` |
| `data/places/naeringsliv/innlandet/lillehammer_bryggeri_historisk_miljo.json` | 1 | `lillehammer_bryggeri_historisk_miljo` | `data/places/naeringsliv/innlandet/lillehammer_bryggeri_historisk_miljo_manifest.json` |
| `data/places/naeringsliv/innlandet/loiten_braenderi.json` | 1 | `loiten_braenderi` | `data/places/naeringsliv/innlandet/loiten_braenderi_manifest.json` |
| `data/places/naeringsliv/innlandet/magnor_glassverk.json` | 1 | `magnor_glassverk` | `data/places/naeringsliv/innlandet/magnor_glassverk_manifest.json` |
| `data/places/naeringsliv/innlandet/mesna_kraft_og_industri.json` | 1 | `mesna_kraft_og_industri` | `data/places/naeringsliv/innlandet/mesna_kraft_og_industri_manifest.json` |
| `data/places/naeringsliv/innlandet/mustad_hunnselva_gjovik.json` | 1 | `mustad_hunnselva_gjovik` | `data/places/naeringsliv/innlandet/mustad_hunnselva_gjovik_manifest.json` |
| `data/places/naeringsliv/innlandet/raufoss_industripark_ammunisjon.json` | 1 | `raufoss_industripark_ammunisjon` | `data/places/naeringsliv/innlandet/raufoss_industripark_ammunisjon_manifest.json` |
| `data/places/naeringsliv/telemark/dalen_hotel_tokke.json` | 1 | `dalen_hotel_tokke` | `data/places/naeringsliv/telemark/dalen_hotel_tokke_manifest.json` |
| `data/places/naeringsliv/telemark/heroya_industripark_porsgrunn.json` | 1 | `heroya_industripark_porsgrunn` | `data/places/naeringsliv/telemark/heroya_industripark_porsgrunn_manifest.json` |
| `data/places/naeringsliv/telemark/klosteroya_union_skien.json` | 1 | `klosteroya_union_skien` | `data/places/naeringsliv/telemark/klosteroya_union_skien_manifest.json` |
| `data/places/naeringsliv/telemark/notodden_industriarv_hydro.json` | 1 | `notodden_industriarv_hydro` | `data/places/naeringsliv/telemark/notodden_industriarv_hydro_manifest.json` |
| `data/places/naeringsliv/telemark/ovre_verket_ulefoss.json` | 1 | `ovre_verket_ulefoss` | `data/places/naeringsliv/telemark/ovre_verket_ulefoss_manifest.json` |
| `data/places/naeringsliv/telemark/porsgrund_porselensfabrik.json` | 1 | `porsgrund_porselensfabrik` | `data/places/naeringsliv/telemark/porsgrund_porselensfabrik_manifest.json` |
| `data/places/naeringsliv/telemark/saheim_kraftverk_rjukan.json` | 1 | `saheim_kraftverk_rjukan` | `data/places/naeringsliv/telemark/saheim_kraftverk_rjukan_manifest.json` |
| `data/places/naeringsliv/telemark/skotfoss_bruk_skien.json` | 1 | `skotfoss_bruk_skien` | `data/places/naeringsliv/telemark/skotfoss_bruk_skien_manifest.json` |
| `data/places/naeringsliv/telemark/svelgfoss_kraftverk_notodden.json` | 1 | `svelgfoss_kraftverk_notodden` | `data/places/naeringsliv/telemark/svelgfoss_kraftverk_notodden_manifest.json` |
| `data/places/naeringsliv/telemark/tinfos_industrimiljo_notodden.json` | 1 | `tinfos_industrimiljo_notodden` | `data/places/naeringsliv/telemark/tinfos_industrimiljo_notodden_manifest.json` |
| `data/places/naeringsliv/telemark/vemork_rjukan_industriarv.json` | 1 | `vemork_rjukan_industriarv` | `data/places/naeringsliv/telemark/vemork_rjukan_industriarv_manifest.json` |
| `data/places/naeringsliv/vestfold/eidsfoss_jernverk.json` | 1 | `eidsfoss_jernverk` | `data/places/naeringsliv/vestfold/eidsfoss_jernverk_manifest.json` |
| `data/places/naeringsliv/vestfold/fritzoe_verk_larvik.json` | 1 | `fritzoe_verk_larvik` | `data/places/naeringsliv/vestfold/fritzoe_verk_larvik_manifest.json` |
| `data/places/naeringsliv/vestfold/melsomvik_verft.json` | 1 | `melsomvik_verft` | `data/places/naeringsliv/vestfold/melsomvik_verft_manifest.json` |
| `data/places/naeringsliv/vestfold/vallo_saltverk.json` | 1 | `vallo_saltverk` | `data/places/naeringsliv/vestfold/vallo_saltverk_manifest.json` |
| `data/places/natur/agder/baneheia_kristiansand_bypark.json` | 1 | `baneheia_kristiansand_bypark` | `data/places/natur/agder/baneheia_kristiansand_bypark_manifest.json` |
| `data/places/natur/agder/bragdoya_kystkultursenter.json` | 1 | `bragdoya_kystkultursenter` | `data/places/natur/agder/bragdoya_kystkultursenter_manifest.json` |
| `data/places/natur/agder/furulunden_mandal_kulturpark.json` | 1 | `furulunden_mandal_kulturpark` | `data/places/natur/agder/furulunden_mandal_kulturpark_manifest.json` |
| `data/places/natur/agder/justoy_kystkultur_lillesand.json` | 1 | `justoy_kystkultur_lillesand` | `data/places/natur/agder/justoy_kystkultur_lillesand_manifest.json` |
| `data/places/natur/agder/ravnedalen_kristiansand.json` | 1 | `ravnedalen_kristiansand` | `data/places/natur/agder/ravnedalen_kristiansand_manifest.json` |
| `data/places/natur/agder/skjernoy_kystkultur_lindesnes.json` | 1 | `skjernoy_kystkultur_lindesnes` | `data/places/natur/agder/skjernoy_kystkultur_lindesnes_manifest.json` |
| `data/places/politikk/innlandet/elverum_folkehogskole_1940.json` | 1 | `elverum_folkehogskole_1940` | `data/places/politikk/innlandet/elverum_folkehogskole_1940_manifest.json` |
| `data/places/politikk/telemark/menstad_bru_menstadslaget.json` | 1 | `menstad_bru_menstadslaget` | `data/places/politikk/telemark/menstad_bru_menstadslaget_manifest.json` |
| `data/places/sport/europa/norway/telemark/morgedal_norsk_skieventyr.json` | 1 | `morgedal_norsk_skieventyr` | `data/places/sport/europa/norway/telemark/morgedal_norsk_skieventyr_manifest.json` |
| `data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json` | 1 | `furuset_aktivitetspark` | `data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark_manifest.json` |
| `data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json` | 1 | `verdensparken_parkour` | `data/places/sport/europa/norway/urban_movement/verdensparken_parkour_manifest.json` |
| `data/places/vitenskap/agder/agder_naturmuseum_kristiansand.json` | 1 | `agder_naturmuseum_kristiansand` | `data/places/vitenskap/agder/agder_naturmuseum_kristiansand_manifest.json` |
| `data/places/vitenskap/agder/dommesmoen_grimstad.json` | 1 | `dommesmoen_grimstad` | `data/places/vitenskap/agder/dommesmoen_grimstad_manifest.json` |
| `data/places/vitenskap/agder/evje_mineralsti.json` | 1 | `evje_mineralsti` | `data/places/vitenskap/agder/evje_mineralsti_manifest.json` |
| `data/places/vitenskap/agder/kristiansand_katedralskole.json` | 1 | `kristiansand_katedralskole` | `data/places/vitenskap/agder/kristiansand_katedralskole_manifest.json` |
| `data/places/vitenskap/agder/setesdal_mineralpark_evje.json` | 1 | `setesdal_mineralpark_evje` | `data/places/vitenskap/agder/setesdal_mineralpark_evje_manifest.json` |

## Missing source files

_None._

## Parse errors

_None._

## Array entries already covered by split manifest

- `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` (26) -> `data/places/by/europe/portugal/lisbon/places_lisbon_by_manifest.json`
- `data/places/by/oslo/places_by.json` (59) -> `data/places/by/oslo/places_by_manifest.json`
- `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json` (6) -> `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv_manifest.json`
- `data/places/film/oslo/places_oslo_film.json` (5) -> `data/places/film/oslo/places_oslo_film_manifest.json`
- `data/places/historie/agder/places_historie_agder_batch1.json` (4) -> `data/places/historie/agder/places_historie_agder_batch1_manifest.json`
- `data/places/historie/agder/places_historie_agder_batch2.json` (4) -> `data/places/historie/agder/places_historie_agder_batch2_manifest.json`
- `data/places/historie/akershus/places_historie_akershus_batch1.json` (12) -> `data/places/historie/akershus/places_historie_akershus_batch1_manifest.json`
- `data/places/historie/akershus/places_historie_akershus_batch2.json` (8) -> `data/places/historie/akershus/places_historie_akershus_batch2_manifest.json`
- `data/places/historie/akershus/places_historie_akershus_batch3.json` (8) -> `data/places/historie/akershus/places_historie_akershus_batch3_manifest.json`
- `data/places/historie/akershus/places_historie_akershus_batch4.json` (8) -> `data/places/historie/akershus/places_historie_akershus_batch4_manifest.json`
- `data/places/historie/akershus/places_historie_akershus_batch5.json` (8) -> `data/places/historie/akershus/places_historie_akershus_batch5_manifest.json`
- `data/places/historie/buskerud/places_historie_buskerud_batch1.json` (9) -> `data/places/historie/buskerud/places_historie_buskerud_batch1_manifest.json`
- `data/places/historie/buskerud/places_historie_buskerud_batch2.json` (8) -> `data/places/historie/buskerud/places_historie_buskerud_batch2_manifest.json`
- `data/places/historie/buskerud/places_historie_buskerud_batch3.json` (8) -> `data/places/historie/buskerud/places_historie_buskerud_batch3_manifest.json`
- `data/places/historie/buskerud/places_historie_buskerud_batch4.json` (8) -> `data/places/historie/buskerud/places_historie_buskerud_batch4_manifest.json`
- `data/places/historie/buskerud/places_historie_buskerud_batch5.json` (8) -> `data/places/historie/buskerud/places_historie_buskerud_batch5_manifest.json`
- `data/places/historie/buskerud/places_historie_buskerud_batch6.json` (8) -> `data/places/historie/buskerud/places_historie_buskerud_batch6_manifest.json`
- `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` (20) -> `data/places/historie/europe/portugal/lisbon/places_lisbon_historie_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch1.json` (5) -> `data/places/historie/innlandet/places_historie_innlandet_batch1_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch10.json` (4) -> `data/places/historie/innlandet/places_historie_innlandet_batch10_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch11.json` (6) -> `data/places/historie/innlandet/places_historie_innlandet_batch11_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch12.json` (8) -> `data/places/historie/innlandet/places_historie_innlandet_batch12_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch13.json` (8) -> `data/places/historie/innlandet/places_historie_innlandet_batch13_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch14.json` (8) -> `data/places/historie/innlandet/places_historie_innlandet_batch14_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch15.json` (8) -> `data/places/historie/innlandet/places_historie_innlandet_batch15_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch16.json` (8) -> `data/places/historie/innlandet/places_historie_innlandet_batch16_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch17.json` (8) -> `data/places/historie/innlandet/places_historie_innlandet_batch17_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch18.json` (8) -> `data/places/historie/innlandet/places_historie_innlandet_batch18_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch2.json` (6) -> `data/places/historie/innlandet/places_historie_innlandet_batch2_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch3.json` (5) -> `data/places/historie/innlandet/places_historie_innlandet_batch3_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch4.json` (7) -> `data/places/historie/innlandet/places_historie_innlandet_batch4_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch5.json` (7) -> `data/places/historie/innlandet/places_historie_innlandet_batch5_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch6.json` (7) -> `data/places/historie/innlandet/places_historie_innlandet_batch6_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch7.json` (6) -> `data/places/historie/innlandet/places_historie_innlandet_batch7_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch8.json` (7) -> `data/places/historie/innlandet/places_historie_innlandet_batch8_manifest.json`
- `data/places/historie/innlandet/places_historie_innlandet_batch9.json` (6) -> `data/places/historie/innlandet/places_historie_innlandet_batch9_manifest.json`
- `data/places/historie/norge/places_historie_norge_for_1500_batch1.json` (10) -> `data/places/historie/norge/places_historie_norge_for_1500_batch1_manifest.json`
- `data/places/historie/norge/places_historie_norge_for_1500_batch2.json` (15) -> `data/places/historie/norge/places_historie_norge_for_1500_batch2_manifest.json`
- `data/places/historie/norge/places_historie_norge_for_1500_batch3.json` (12) -> `data/places/historie/norge/places_historie_norge_for_1500_batch3_manifest.json`
- `data/places/historie/norge/places_historie_norge_for_1500_batch4.json` (6) -> `data/places/historie/norge/places_historie_norge_for_1500_batch4_manifest.json`
- `data/places/historie/oslo/places_historie_added_batch_01.json` (7) -> `data/places/historie/oslo/places_historie_added_batch_01_manifest.json`
- `data/places/historie/oslo/places_historie.json` (18) -> `data/places/historie/oslo/places_historie_manifest.json`
- `data/places/historie/ostfold/places_historie_ostfold_batch1.json` (9) -> `data/places/historie/ostfold/places_historie_ostfold_batch1_manifest.json`
- `data/places/historie/ostfold/places_historie_ostfold_batch2.json` (8) -> `data/places/historie/ostfold/places_historie_ostfold_batch2_manifest.json`
- `data/places/historie/ostfold/places_historie_ostfold_batch3.json` (8) -> `data/places/historie/ostfold/places_historie_ostfold_batch3_manifest.json`
- `data/places/historie/ostfold/places_historie_ostfold_batch4.json` (8) -> `data/places/historie/ostfold/places_historie_ostfold_batch4_manifest.json`
- `data/places/historie/ostfold/places_historie_ostfold_batch5.json` (8) -> `data/places/historie/ostfold/places_historie_ostfold_batch5_manifest.json`
- `data/places/historie/ostfold/places_historie_ostfold_batch6.json` (8) -> `data/places/historie/ostfold/places_historie_ostfold_batch6_manifest.json`
- `data/places/historie/telemark/places_historie_telemark_batch1.json` (5) -> `data/places/historie/telemark/places_historie_telemark_batch1_manifest.json`
- `data/places/historie/telemark/places_historie_telemark_batch2.json` (5) -> `data/places/historie/telemark/places_historie_telemark_batch2_manifest.json`
- `data/places/historie/telemark/places_historie_telemark_batch3.json` (5) -> `data/places/historie/telemark/places_historie_telemark_batch3_manifest.json`
- `data/places/historie/telemark/places_historie_telemark_batch4.json` (3) -> `data/places/historie/telemark/places_historie_telemark_batch4_manifest.json`
- `data/places/historie/telemark/places_historie_telemark_batch5.json` (3) -> `data/places/historie/telemark/places_historie_telemark_batch5_manifest.json`
- `data/places/historie/telemark/places_historie_telemark_batch6.json` (3) -> `data/places/historie/telemark/places_historie_telemark_batch6_manifest.json`
- `data/places/historie/telemark/places_historie_telemark_batch7.json` (5) -> `data/places/historie/telemark/places_historie_telemark_batch7_manifest.json`
- `data/places/historie/vestfold/places_historie_vestfold_batch1.json` (7) -> `data/places/historie/vestfold/places_historie_vestfold_batch1_manifest.json`
- `data/places/historie/vestfold/places_historie_vestfold_batch2.json` (8) -> `data/places/historie/vestfold/places_historie_vestfold_batch2_manifest.json`
- `data/places/historie/vestfold/places_historie_vestfold_batch3.json` (8) -> `data/places/historie/vestfold/places_historie_vestfold_batch3_manifest.json`
- `data/places/historie/vestfold/places_historie_vestfold_batch4.json` (7) -> `data/places/historie/vestfold/places_historie_vestfold_batch4_manifest.json`
- `data/places/historie/vestfold/places_historie_vestfold_batch5.json` (5) -> `data/places/historie/vestfold/places_historie_vestfold_batch5_manifest.json`
- `data/places/historie/vestfold/places_historie_vestfold_batch6.json` (7) -> `data/places/historie/vestfold/places_historie_vestfold_batch6_manifest.json`
- `data/places/historie/vestfold/places_historie_vestfold_batch7.json` (3) -> `data/places/historie/vestfold/places_historie_vestfold_batch7_manifest.json`
- `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` (14) -> `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst_manifest.json`
- `data/places/kunst/oslo/places_kunst.json` (4) -> `data/places/kunst/oslo/places_kunst_manifest.json`
- `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` (11) -> `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur_manifest.json`
- `data/places/litteratur/oslo/places_litteratur.json` (20) -> `data/places/litteratur/oslo/places_litteratur_manifest.json`
- `data/places/media/europe/portugal/lisbon/places_lisbon_media.json` (5) -> `data/places/media/europe/portugal/lisbon/places_lisbon_media_manifest.json`
- `data/places/media/oslo/places_oslo_media.json` (6) -> `data/places/media/oslo/places_oslo_media_manifest.json`
- `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` (7) -> `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk_manifest.json`
- `data/places/musikk/oslo/places_musikk.json` (6) -> `data/places/musikk/oslo/places_musikk_manifest.json`
- `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` (22) -> `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv_manifest.json`
- `data/places/naeringsliv/oslo/places_naeringsliv.json` (33) -> `data/places/naeringsliv/oslo/places_naeringsliv_manifest.json`
- `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` (11) -> `data/places/natur/europe/portugal/lisbon/places_lisbon_natur_manifest.json`
- `data/places/natur/oslo/places_oslo_alna.json` (7) -> `data/places/natur/oslo/places_oslo_alna_manifest.json`
- `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` (23) -> `data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json`
- `data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json` (8) -> `data/places/natur/oslo/places_oslo_natur_alnaelva_rute_manifest.json`
- `data/places/natur/oslo/places_oslo_natur_bygdoy.json` (6) -> `data/places/natur/oslo/places_oslo_natur_bygdoy_manifest.json`
- `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` (9) -> `data/places/natur/oslo/places_oslo_natur_hovedsteder_manifest.json`
- `data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json` (7) -> `data/places/natur/oslo/places_oslo_natur_ljanselva_rute_manifest.json`
- `data/places/natur/oslo/places_oslo_natur_ostensjovannet.json` (5) -> `data/places/natur/oslo/places_oslo_natur_ostensjovannet_manifest.json`
- `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` (4) -> `data/places/natur/oslo/places_oslo_natur_salamanderdammer_manifest.json`
- `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` (9) -> `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk_manifest.json`
- `data/places/politikk/oslo/places_politikk.json` (8) -> `data/places/politikk/oslo/places_politikk_manifest.json`
- `data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json` (6) -> `data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur_manifest.json`
- `data/places/popkultur/oslo/places_oslo_populaerkultur.json` (9) -> `data/places/popkultur/oslo/places_oslo_populaerkultur_manifest.json`
- `data/places/psykologi/oslo/places_psykologi.json` (1) -> `data/places/psykologi/oslo/places_psykologi_manifest.json`
- `data/places/sport/europa/england/footballgrounds_london.json` (12) -> `data/places/sport/europa/england/footballgrounds_london_manifest.json`
- `data/places/sport/europa/norway/oslo_sport.json` (15) -> `data/places/sport/europa/norway/oslo_sport_manifest.json`
- `data/places/sport/europa/norway/places_motorsport_ostlandet.json` (11) -> `data/places/sport/europa/norway/places_motorsport_ostlandet_manifest.json`
- `data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json` (15) -> `data/places/sport/europa/norway/places_oslo_lekeplasser_trening_manifest.json`
- `data/places/sport/europa/portugal/footballgrounds_lisbon.json` (6) -> `data/places/sport/europa/portugal/footballgrounds_lisbon_manifest.json`
- `data/places/sport/europa/portugal/sportvenues_lisbon.json` (5) -> `data/places/sport/europa/portugal/sportvenues_lisbon_manifest.json`
- `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` (9) -> `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur_manifest.json`
- `data/places/subkultur/oslo/places_subkultur.json` (30) -> `data/places/subkultur/oslo/places_subkultur_manifest.json`
- `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` (11) -> `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap_manifest.json`
- `data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner.json` (2) -> `data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner_manifest.json`
- `data/places/vitenskap/oslo/places_vitenskap.json` (16) -> `data/places/vitenskap/oslo/places_vitenskap_manifest.json`
