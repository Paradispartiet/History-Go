# Place coordinate quality gate

Generert: 2026-08-30T18:37:20.228Z

## Oppsummering
- Aktive filer validert: **1545**
- Antall steder validert: **1545**
- Harde feil: **0**
- Varsler: **663**
- Coordinate review candidates: **808** signaler fordelt på **703** steder

Nivåene betyr:
- **Harde feil**: formelle koordinatfeil (ugyldig/manglende lat/lon/r, ødelagte anchors, manglende filer). Disse stopper gaten.
- **Varsler**: sannsynlige posisjonsrisikoer basert på enkle heuristikker.
- **Coordinate review candidates**: steder der repo-data alene ikke gir grunn til å stole på punktet. Signalene beviser ikke at posisjonen er feil – de peker ut kandidater for manuell kartkontroll.

## Beskyttede koordinater
Koordinater med `coordStatus=verified` eller `coordStatus=semantic_anchor` skal ikke overskrives av en manuell enkeltpatch uten ny `coordSource`, ny `coordNote` og eksplisitt begrunnelse for hvorfor tidligere koordinat var feil. Hvis et slikt sted flyttes mer enn 150 meter fra versjonen i `HEAD`, flagges endringen som `coordinate_regression_risk`.

## Aktive filer validert
- data/places/by/oslo/places/torggata.json
- data/places/by/oslo/places/bispelokket.json
- data/places/by/oslo/places/gronland_basarene.json
- data/places/by/oslo/places/karl_johan.json
- data/places/by/oslo/places/radhusplassen.json
- data/places/by/oslo/places/bjorvika.json
- data/places/by/oslo/places/ring_3.json
- data/places/by/oslo/places/trikk_17_18.json
- data/places/by/oslo/places/grunerlokka_helgesens_tm.json
- data/places/by/oslo/places/toyen_torg.json
- data/places/by/oslo/places/majorstuen_krysset.json
- data/places/by/oslo/places/st_hanshaugen_park.json
- data/places/by/oslo/places/oslo_s.json
- data/places/by/oslo/places/vulkan_energisentral.json
- data/places/by/oslo/places/aker_brygge.json
- data/places/by/oslo/places/tigeren.json
- data/places/by/oslo/places/gronland_kirke.json
- data/places/by/oslo/places/kampen_kirke.json
- data/places/by/oslo/places/jernbanetorget.json
- data/places/by/oslo/places/oslo_bussterminal.json
- data/places/by/oslo/places/helsfyr.json
- data/places/by/oslo/places/bogstadveien.json
- data/places/by/oslo/places/markveien.json
- data/places/by/oslo/places/gronlandsleiret.json
- data/places/by/oslo/places/storgata.json
- data/places/by/oslo/places/ullevål_hageby.json
- data/places/by/oslo/places/romsaås.json
- data/places/by/oslo/places/rodelokka.json
- data/places/by/oslo/places/vaalerenga.json
- data/places/by/oslo/places/vinderen.json
- data/places/by/oslo/places/ullern.json
- data/places/by/oslo/places/spikersuppa.json
- data/places/by/oslo/places/bankplassen.json
- data/places/by/oslo/places/christiania_torv.json
- data/places/by/oslo/places/slottsparken.json
- data/places/by/oslo/places/botsparken.json
- data/places/by/oslo/places/stensparken.json
- data/places/by/oslo/places/nydalen.json
- data/places/by/oslo/places/tjuvholmen.json
- data/places/by/oslo/places/sorenga.json
- data/places/by/oslo/places/majorstuen_tbanestasjon.json
- data/places/by/oslo/places/nationaltheatret_stasjon.json
- data/places/by/oslo/places/bislett.json
- data/places/by/oslo/places/olaf_ryes_plass.json
- data/places/by/oslo/places/birkelunden.json
- data/places/by/oslo/places/akerselva.json
- data/places/by/oslo/places/universitetsplassen.json
- data/places/by/oslo/places/deichman_bjorvika.json
- data/places/by/oslo/places/barcode.json
- data/places/by/oslo/places/vigelandsparken.json
- data/places/by/oslo/places/voienvolden.json
- data/places/by/oslo/places/carl_berner_plass.json
- data/places/by/oslo/places/tullin.json
- data/places/by/oslo/places/okern.json
- data/places/by/oslo/places/skoyen.json
- data/places/by/oslo/places/torshov.json
- data/places/by/oslo/places/grorud.json
- data/places/by/oslo/places/sagene.json
- data/places/film/oslo/places/saga_kino.json
- data/places/film/oslo/places/klingenberg_kino.json
- data/places/film/oslo/places/gimle_kino.json
- data/places/film/oslo/places/vika_kino.json
- data/places/film/oslo/places/hartvig_nissens_skole_skam.json
- data/places/historie/oslo/places_historie/middelalder_oslo.json
- data/places/historie/oslo/places_historie/gamlebyen_gravlund.json
- data/places/historie/oslo/places_historie/akershus_festning.json
- data/places/historie/oslo/places_historie/gamle_aker_kirke.json
- data/places/historie/oslo/places_historie/var_frelsers_gravlund.json
- data/places/historie/oslo/places_historie/hovedoya_kloster.json
- data/places/historie/oslo/places_historie/villa_grande.json
- data/places/historie/oslo/places_historie/bogstad_gard.json
- data/places/historie/oslo/places_historie/mollergata_19.json
- data/places/historie/oslo/places_historie/sagene_skole.json
- data/places/by/oslo/oslo_domkirke/oslo_domkirke.json
- data/places/by/oslo/damstredet_telthusbakken/damstredet_telthusbakken.json
- data/places/by/oslo/gamle_trikkestallen/gamle_trikkestallen.json
- data/places/politikk/oslo/slottet/slottet.json
- data/places/by/oslo/sofienberg_kirke/sofienberg_kirke.json
- data/places/by/oslo/trefoldighetskirken/trefoldighetskirken.json
- data/places/historie/oslo/places_historie_added_batch_01/nonneseter_kloster.json
- data/places/historie/oslo/places_historie_added_batch_01/oslo_ladegard.json
- data/places/historie/oslo/places_historie_added_batch_01/galgeberg.json
- data/places/historie/oslo/places_historie_added_batch_01/oslo_hospital.json
- data/places/historie/oslo/places_historie_added_batch_01/botsfengselet.json
- data/places/historie/oslo/places_historie_added_batch_01/prinds_christian_augusts_minde.json
- data/places/historie/oslo/places_historie_added_batch_01/peststotten_krist_kirkegard.json
- data/places/historie/oslo/places_historie_added_batch_01/kjaerlighetskarusellen.json
- data/places/historie/oslo/places_historie_added_batch_01/villa_stenersen.json
- data/places/historie/oslo/places_historie_added_batch_01/st_hallvard_kirke_kloster.json
- data/places/by/oslo/gamle_radhus/gamle_radhus.json
- data/places/historie/akershus/places_historie_akershus_batch1/nostvet_boplass.json
- data/places/historie/akershus/places_historie_akershus_batch1/raknehaugen.json
- data/places/historie/akershus/places_historie_akershus_batch1/nes_kirkeruiner.json
- data/places/historie/akershus/places_historie_akershus_batch1/blaker_skanse.json
- data/places/historie/akershus/places_historie_akershus_batch1/fetsund_lenser.json
- data/places/historie/akershus/places_historie_akershus_batch1/oscarsborg_festning.json
- data/places/historie/akershus/places_historie_akershus_batch1/trandumskogen.json
- data/places/historie/akershus/grini_fangeleir.json
- data/places/naeringsliv/akershus/baerums_verk_jernverk/baerums_verk_jernverk.json
- data/places/politikk/akershus/eidsvollsbygningen/eidsvollsbygningen.json
- data/places/naeringsliv/akershus/eidsvoll_verk_andelva/eidsvoll_verk_andelva.json
- data/places/by/akershus/tertitten_urskog_holandsbanen/tertitten_urskog_holandsbanen.json
- data/places/by/akershus/kjeller_flyplass/kjeller_flyplass.json
- data/places/historie/akershus/places_historie_akershus_batch2/tanum_kirke.json
- data/places/historie/akershus/places_historie_akershus_batch2/haslum_kirke.json
- data/places/historie/akershus/places_historie_akershus_batch2/skedsmo_kirke.json
- data/places/historie/akershus/places_historie_akershus_batch2/enebakk_kirke.json
- data/places/historie/akershus/places_historie_akershus_batch2/asker_kirke_kirkested.json
- data/places/historie/akershus/places_historie_akershus_batch2/gamle_hvam_museum.json
- data/places/historie/akershus/places_historie_akershus_batch2/heggedal_hovedgard.json
- data/places/by/akershus/hvitsten_sjobodene/hvitsten_sjobodene.json
- data/places/historie/akershus/places_historie_akershus_batch3/vollen_maudbukta.json
- data/places/historie/akershus/places_historie_akershus_batch3/roald_amundsens_hjem_uranienborg.json
- data/places/historie/akershus/places_historie_akershus_batch3/stunner_boplass.json
- data/places/historie/akershus/places_historie_akershus_batch3/ski_middelalderkirke.json
- data/places/historie/akershus/places_historie_akershus_batch3/krakstad_kirke_og_gravhaug.json
- data/places/by/akershus/son_ladested/son_ladested.json
- data/places/by/akershus/holen_ladested/holen_ladested.json
- data/places/naeringsliv/akershus/hurdal_verk_glassverk/hurdal_verk_glassverk.json
- data/places/historie/akershus/places_historie_akershus_batch4/lunner_kirke.json
- data/places/historie/akershus/places_historie_akershus_batch4/nesodden_kirke.json
- data/places/historie/akershus/places_historie_akershus_batch4/seiersten_skanse.json
- data/places/historie/akershus/places_historie_akershus_batch4/raelingen_bygdetun.json
- data/places/historie/akershus/places_historie_akershus_batch4/losby_gods.json
- data/places/naeringsliv/akershus/hadeland_glassverk/hadeland_glassverk.json
- data/places/naeringsliv/akershus/kistefos_traesliperi/kistefos_traesliperi.json
- data/places/naeringsliv/akershus/hakadal_verk/hakadal_verk.json
- data/places/historie/akershus/places_historie_akershus_batch5/frogner_gamle_kirke.json
- data/places/historie/akershus/places_historie_akershus_batch5/sorum_kirke.json
- data/places/historie/akershus/places_historie_akershus_batch5/gardermoen_militaerleir_tunet.json
- data/places/historie/akershus/places_historie_akershus_batch5/ullensaker_kirke_kirkested.json
- data/places/historie/akershus/places_historie_akershus_batch5/aurskog_holand_bygdetun.json
- data/places/historie/akershus/places_historie_akershus_batch5/nannestad_bygdemuseum.json
- data/places/naeringsliv/akershus/feiring_jernverk/feiring_jernverk.json
- data/places/by/akershus/drobak_kirke/drobak_kirke.json
- data/places/historie/ostfold/places_historie_ostfold_batch1/fredriksten_festning.json
- data/places/historie/ostfold/places_historie_ostfold_batch1/fredrikstad_festning_gamlebyen.json
- data/places/historie/ostfold/places_historie_ostfold_batch1/borgarsyssel_museum_olavsbyen.json
- data/places/historie/ostfold/places_historie_ostfold_batch1/solbergfeltet_helleristninger.json
- data/places/historie/ostfold/places_historie_ostfold_batch1/hunnfeltet_gravfelt.json
- data/places/historie/ostfold/places_historie_ostfold_batch1/tune_skipet_funnsted.json
- data/places/historie/ostfold/places_historie_ostfold_batch1/hafslund_hovedgard.json
- data/places/historie/ostfold/places_historie_ostfold_batch1/rod_herregard.json
- data/places/politikk/ostfold/moss_jernverk_konventionsgarden/moss_jernverk_konventionsgarden.json
- data/places/historie/ostfold/places_historie_ostfold_batch2/gjellestadskipet_jellhaugen.json
- data/places/historie/ostfold/places_historie_ostfold_batch2/hoytorp_fort.json
- data/places/historie/ostfold/places_historie_ostfold_batch2/basmo_festning.json
- data/places/historie/ostfold/places_historie_ostfold_batch2/eidsberg_kirke.json
- data/places/historie/ostfold/places_historie_ostfold_batch2/rygge_kirke.json
- data/places/historie/ostfold/places_historie_ostfold_batch2/hvaler_kirke.json
- data/places/by/ostfold/orje_sluser_haldenkanalen/orje_sluser_haldenkanalen.json
- data/places/naeringsliv/ostfold/askim_gummivarefabrikk/askim_gummivarefabrikk.json
- data/places/historie/ostfold/places_historie_ostfold_batch3/skjeberg_kirke.json
- data/places/historie/ostfold/places_historie_ostfold_batch3/indreroed_gard_fredrikstad.json
- data/places/historie/ostfold/places_historie_ostfold_batch3/varne_kloster.json
- data/places/historie/ostfold/places_historie_ostfold_batch3/onsøy_kirke.json
- data/places/naeringsliv/ostfold/borregaard_sarpsborg_industri/borregaard_sarpsborg_industri.json
- data/places/natur/ostfold/sarpsfossen/sarpsfossen.json
- data/places/politikk/ostfold/spydeberg_prestegard_1814/spydeberg_prestegard_1814.json
- data/places/naeringsliv/ostfold/tistedalen_saugbrugsforeningen/tistedalen_saugbrugsforeningen.json
- data/places/historie/ostfold/places_historie_ostfold_batch4/isegran_fort_verft.json
- data/places/historie/ostfold/places_historie_ostfold_batch4/akeroya_fort.json
- data/places/historie/ostfold/places_historie_ostfold_batch4/trogstad_fort.json
- data/places/historie/ostfold/places_historie_ostfold_batch4/rodenes_kirke.json
- data/places/historie/ostfold/places_historie_ostfold_batch4/rakkestad_prestegard_1814.json
- data/places/historie/ostfold/places_historie_ostfold_batch4/aremark_kirke_kirkested.json
- data/places/scenekunst/ostfold/fredrikshalds_teater/fredrikshalds_teater.json
- data/places/by/ostfold/kornsjo_grensestasjon/kornsjo_grensestasjon.json
- data/places/historie/ostfold/places_historie_ostfold_batch5/tomb_herregard.json
- data/places/historie/ostfold/places_historie_ostfold_batch5/tune_kirke_kirkested.json
- data/places/historie/ostfold/places_historie_ostfold_batch5/idd_kirke.json
- data/places/historie/ostfold/places_historie_ostfold_batch5/hobol_kirke.json
- data/places/historie/ostfold/places_historie_ostfold_batch5/rakkestad_kirke.json
- data/places/by/ostfold/brekke_sluser_haldenkanalen/brekke_sluser_haldenkanalen.json
- data/places/by/ostfold/stromsfoss_sluser/stromsfoss_sluser.json
- data/places/naeringsliv/ostfold/moss_mollebyen_industri/moss_mollebyen_industri.json
- data/places/historie/ostfold/places_historie_ostfold_batch6/folkenborg_museum.json
- data/places/historie/ostfold/places_historie_ostfold_batch6/elingaard_herregard.json
- data/places/historie/ostfold/places_historie_ostfold_batch6/nes_lensemuseum.json
- data/places/historie/ostfold/places_historie_ostfold_batch6/spydeberg_kirke.json
- data/places/historie/ostfold/places_historie_ostfold_batch6/trogstad_kirke.json
- data/places/historie/ostfold/places_historie_ostfold_batch6/skiptvet_kirke.json
- data/places/historie/ostfold/places_historie_ostfold_batch6/momarken_markedsplass.json
- data/places/by/ostfold/homlungen_fyr/homlungen_fyr.json
- data/places/historie/buskerud/places_historie_buskerud_batch1/veien_kulturminnepark.json
- data/places/historie/buskerud/places_historie_buskerud_batch1/norderhov_prestegard_1716.json
- data/places/historie/buskerud/places_historie_buskerud_batch1/nore_stavkirke.json
- data/places/historie/buskerud/places_historie_buskerud_batch1/uvdal_stavkirke.json
- data/places/historie/buskerud/places_historie_buskerud_batch1/rollag_stavkirke.json
- data/places/historie/buskerud/places_historie_buskerud_batch1/flesberg_stavkirke.json
- data/places/historie/buskerud/places_historie_buskerud_batch1/fossesholm_herregard.json
- data/places/naeringsliv/buskerud/kongsberg_solvverk/kongsberg_solvverk.json
- data/places/naeringsliv/buskerud/blaafarvevaerket_modum/blaafarvevaerket_modum.json
- data/places/historie/buskerud/places_historie_buskerud_batch2/torpo_stavkirke.json
- data/places/historie/buskerud/places_historie_buskerud_batch2/hol_gamle_kyrkje.json
- data/places/historie/buskerud/places_historie_buskerud_batch2/hallingdal_museum_nesbyen.json
- data/places/historie/buskerud/places_historie_buskerud_batch2/drammen_museum_marienlyst.json
- data/places/historie/buskerud/places_historie_buskerud_batch2/haug_kirke_eiker.json
- data/places/historie/buskerud/places_historie_buskerud_batch2/lier_bygdetun.json
- data/places/by/buskerud/kroderbanen_kroderen_stasjon/kroderbanen_kroderen_stasjon.json
- data/places/naeringsliv/buskerud/nostetangen_glassverk/nostetangen_glassverk.json
- data/places/historie/buskerud/places_historie_buskerud_batch3/boensnes_kirke.json
- data/places/historie/buskerud/places_historie_buskerud_batch3/stein_gard_halvdanshaugen.json
- data/places/historie/buskerud/places_historie_buskerud_batch3/kongsberg_kirke.json
- data/places/historie/buskerud/places_historie_buskerud_batch3/lausen_kapell_ruin.json
- data/places/naeringsliv/buskerud/labro_museum/labro_museum.json
- data/places/litteratur/buskerud/portaasen_wildenvey/portaasen_wildenvey.json
- data/places/naeringsliv/buskerud/eggedal_molle/eggedal_molle.json
- data/places/by/buskerud/drammen_tollbod_havn/drammen_tollbod_havn.json
- data/places/historie/buskerud/places_historie_buskerud_batch4/laagdalsmuseet.json
- data/places/historie/buskerud/places_historie_buskerud_batch4/fiskum_gamle_kirke.json
- data/places/historie/buskerud/places_historie_buskerud_batch4/hvalsmoen_leir.json
- data/places/historie/buskerud/places_historie_buskerud_batch4/dagali_museum.json
- data/places/naeringsliv/buskerud/kjerraten_i_asa/kjerraten_i_asa.json
- data/places/naeringsliv/buskerud/hassel_jernverk/hassel_jernverk.json
- data/places/vitenskap/buskerud/bergseminaret_kongsberg/bergseminaret_kongsberg.json
- data/places/by/buskerud/gamle_nesbyen/gamle_nesbyen.json
- data/places/historie/buskerud/places_historie_buskerud_batch5/gulskogen_gard.json
- data/places/historie/buskerud/places_historie_buskerud_batch5/aal_bygdamuseum.json
- data/places/historie/buskerud/places_historie_buskerud_batch5/gol_bygdemuseum.json
- data/places/historie/buskerud/places_historie_buskerud_batch5/hemsedal_bygdatun.json
- data/places/historie/buskerud/places_historie_buskerud_batch5/krokkleiva_kongeveien.json
- data/places/historie/buskerud/places_historie_buskerud_batch5/bragernes_kirke.json
- data/places/kunst/buskerud/lauvlia_kittelsen/lauvlia_kittelsen.json
- data/places/kunst/buskerud/hagan_skredsvig/hagan_skredsvig.json
- data/places/historie/buskerud/places_historie_buskerud_batch6/modum_bad_st_olafs_kilde.json
- data/places/historie/buskerud/places_historie_buskerud_batch6/lier_sykehus_historisk_omrade.json
- data/places/by/buskerud/riddergarden_honefoss/riddergarden_honefoss.json
- data/places/naeringsliv/buskerud/nore_i_kraftverk/nore_i_kraftverk.json
- data/places/naeringsliv/buskerud/sundvollen_hotell_skysskifte/sundvollen_hotell_skysskifte.json
- data/places/naeringsliv/buskerud/union_papirfabrikk_drammen/union_papirfabrikk_drammen.json
- data/places/naeringsliv/buskerud/solberg_spinderi/solberg_spinderi.json
- data/places/by/buskerud/vikersund_stasjon_randsfjordbanen/vikersund_stasjon_randsfjordbanen.json
- data/places/historie/innlandet/places_historie_innlandet_batch1/domkirkeodden_hamar.json
- data/places/historie/innlandet/places_historie_innlandet_batch1/maihaugen_lillehammer.json
- data/places/historie/innlandet/places_historie_innlandet_batch1/ringebu_stavkirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch1/lom_stavkirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch1/kongsvinger_festning.json
- data/places/litteratur/innlandet/aulestad_bjornson/aulestad_bjornson.json
- data/places/naeringsliv/innlandet/klevfos_cellulose/klevfos_cellulose.json
- data/places/naeringsliv/innlandet/atlungstad_brenneri/atlungstad_brenneri.json
- data/places/historie/innlandet/places_historie_innlandet_batch2/norsk_jernbanemuseum_hamar.json
- data/places/historie/innlandet/places_historie_innlandet_batch2/gjovik_gard.json
- data/places/historie/innlandet/places_historie_innlandet_batch2/norsk_skogmuseum_elverum.json
- data/places/historie/innlandet/places_historie_innlandet_batch2/glomdalsmuseet_elverum.json
- data/places/historie/innlandet/places_historie_innlandet_batch2/hegge_stavkirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch2/reinli_stavkirke.json
- data/places/by/innlandet/skibladner_gjovik/skibladner_gjovik.json
- data/places/litteratur/innlandet/bjerkebaek_undset/bjerkebaek_undset.json
- data/places/historie/innlandet/places_historie_innlandet_batch3/hundorp_dale_gudbrand.json
- data/places/historie/innlandet/places_historie_innlandet_batch3/norsk_utvandrermuseum_ottestad.json
- data/places/historie/innlandet/places_historie_innlandet_batch3/lesja_bygdemuseum.json
- data/places/historie/innlandet/places_historie_innlandet_batch3/bagnsbergatn_krigsminne.json
- data/places/historie/innlandet/places_historie_innlandet_batch3/tolga_os_museum.json
- data/places/naeringsliv/innlandet/folldal_gruver/folldal_gruver.json
- data/places/naeringsliv/innlandet/raufoss_industripark_ammunisjon/raufoss_industripark_ammunisjon.json
- data/places/naeringsliv/innlandet/kvikne_kobberverk/kvikne_kobberverk.json
- data/places/historie/innlandet/places_historie_innlandet_batch4/granavollen_sosterkirkene.json
- data/places/historie/innlandet/places_historie_innlandet_batch4/hadeland_folkemuseum.json
- data/places/historie/innlandet/places_historie_innlandet_batch4/norsk_vegmuseum_oyer.json
- data/places/historie/innlandet/places_historie_innlandet_batch4/nybergsund_kongens_nei.json
- data/places/historie/innlandet/places_historie_innlandet_batch4/stange_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch4/balke_kirke_toten.json
- data/places/historie/innlandet/places_historie_innlandet_batch4/kvinnemuseet_kongsvinger.json
- data/places/politikk/innlandet/elverum_folkehogskole_1940/elverum_folkehogskole_1940.json
- data/places/historie/innlandet/places_historie_innlandet_batch5/lomen_stavkirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch5/oye_stavkirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch5/hedalen_stavkirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch5/vaga_kyrkje.json
- data/places/historie/innlandet/places_historie_innlandet_batch5/garmo_stavkirke_maihaugen.json
- data/places/historie/innlandet/places_historie_innlandet_batch5/sygard_grytting_pilegrimsgard.json
- data/places/historie/innlandet/places_historie_innlandet_batch5/matrand_slagsted_1814.json
- data/places/naeringsliv/innlandet/magnor_glassverk/magnor_glassverk.json
- data/places/historie/innlandet/places_historie_innlandet_batch6/finnetunet_skogfinsk_museum.json
- data/places/historie/innlandet/places_historie_innlandet_batch6/sor_fron_kirke_gudbrandsdalsdomen.json
- data/places/historie/innlandet/places_historie_innlandet_batch6/lesja_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch6/valdres_folkemuseum_fagernes.json
- data/places/historie/innlandet/places_historie_innlandet_batch6/odalstunet_sor_odal.json
- data/places/historie/innlandet/places_historie_innlandet_batch6/tynset_bygdemuseum.json
- data/places/historie/innlandet/places_historie_innlandet_batch6/eidskog_museum_almenninga.json
- data/places/by/innlandet/hamar_stasjon_jernbanebyen/hamar_stasjon_jernbanebyen.json
- data/places/historie/innlandet/places_historie_innlandet_batch7/ringsaker_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch7/dovre_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch7/sel_kirke_otta.json
- data/places/historie/innlandet/places_historie_innlandet_batch7/rendalen_bygdemuseum.json
- data/places/historie/innlandet/places_historie_innlandet_batch7/skjaak_bygdamuseum.json
- data/places/historie/innlandet/places_historie_innlandet_batch7/stenberg_toten_museum.json
- data/places/litteratur/innlandet/proysenstua_rudshogda/proysenstua_rudshogda.json
- data/places/litteratur/innlandet/proysenhuset_rudshogda.json
- data/places/naeringsliv/innlandet/femundshytten_smeltverk/femundshytten_smeltverk.json
- data/places/historie/innlandet/places_historie_innlandet_batch8/jorstadmoen_leir.json
- data/places/historie/innlandet/places_historie_innlandet_batch8/nordberg_fort.json
- data/places/historie/innlandet/places_historie_innlandet_batch8/gausdal_bygdetun.json
- data/places/historie/innlandet/places_historie_innlandet_batch8/trysil_bygdetun.json
- data/places/historie/innlandet/places_historie_innlandet_batch8/solor_museum_flisa.json
- data/places/historie/innlandet/places_historie_innlandet_batch8/grue_kirke_brannminne.json
- data/places/historie/innlandet/places_historie_innlandet_batch8/lom_bygdamuseum_presthaugen.json
- data/places/historie/innlandet/places_historie_innlandet_batch9/blokkodden_villmarksmuseum.json
- data/places/historie/innlandet/places_historie_innlandet_batch9/husantunet_alvdal_bygdemuseum.json
- data/places/historie/innlandet/places_historie_innlandet_batch9/koppangtunet_stor_elvdal.json
- data/places/historie/innlandet/places_historie_innlandet_batch9/tylldalen_bygdetun.json
- data/places/historie/innlandet/places_historie_innlandet_batch9/faaberg_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch9/vang_kirke_hamar.json
- data/places/naeringsliv/innlandet/mesna_kraft_og_industri/mesna_kraft_og_industri.json
- data/places/naeringsliv/innlandet/lillehammer_bryggeri_historisk_miljo/lillehammer_bryggeri_historisk_miljo.json
- data/places/historie/innlandet/places_historie_innlandet_batch10/land_museum_dokka.json
- data/places/historie/innlandet/places_historie_innlandet_batch10/vang_stavkirke_tomta_valdres.json
- data/places/historie/innlandet/places_historie_innlandet_batch10/nord_odal_bygdetun_sand.json
- data/places/historie/innlandet/places_historie_innlandet_batch10/valer_kirke_brannminne.json
- data/places/naeringsliv/innlandet/kistefos_tresliperi_jevnaker/kistefos_tresliperi_jevnaker.json
- data/places/naeringsliv/innlandet/kapp_melkefabrikk/kapp_melkefabrikk.json
- data/places/naeringsliv/innlandet/loiten_braenderi/loiten_braenderi.json
- data/places/historie/innlandet/places_historie_innlandet_batch11/tingelstad_gamle_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch11/fluberg_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch11/biri_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch11/bagn_bygdesamling.json
- data/places/historie/innlandet/places_historie_innlandet_batch11/etnedal_bygdetun_bruflat.json
- data/places/historie/innlandet/places_historie_innlandet_batch11/brandval_kirke.json
- data/places/naeringsliv/innlandet/mustad_hunnselva_gjovik/mustad_hunnselva_gjovik.json
- data/places/naeringsliv/innlandet/brumunddal_molle_industri/brumunddal_molle_industri.json
- data/places/historie/innlandet/places_historie_innlandet_batch12/hjerkinn_fjellstue.json
- data/places/historie/innlandet/places_historie_innlandet_batch12/budsjord_pilegrimsgard.json
- data/places/historie/innlandet/places_historie_innlandet_batch12/jutulheimen_vagaa_bygdamuseum.json
- data/places/historie/innlandet/places_historie_innlandet_batch12/follebu_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch12/heidal_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch12/hoff_kirke_toten.json
- data/places/naeringsliv/innlandet/gjovik_glassverk_historisk_miljo/gjovik_glassverk_historisk_miljo.json
- data/places/by/innlandet/eina_stasjon_totenbanen/eina_stasjon_totenbanen.json
- data/places/historie/innlandet/places_historie_innlandet_batch13/aurdal_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch13/nes_kirke_ringsaker.json
- data/places/historie/innlandet/places_historie_innlandet_batch13/lillehammer_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch13/ullinsvin_vagaa_prestegard.json
- data/places/historie/innlandet/places_historie_innlandet_batch13/bjorge_gard_ringebu.json
- data/places/naeringsliv/innlandet/espedalen_nikkelverk/espedalen_nikkelverk.json
- data/places/by/innlandet/fagernes_stasjon_valdresbanen/fagernes_stasjon_valdresbanen.json
- data/places/by/innlandet/lillehammer_stasjon/lillehammer_stasjon.json
- data/places/historie/innlandet/places_historie_innlandet_batch14/rena_leir.json
- data/places/historie/innlandet/places_historie_innlandet_batch14/sanderud_sykehus_historisk_omrade.json
- data/places/historie/innlandet/places_historie_innlandet_batch14/romedal_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch14/snertingdal_kirke.json
- data/places/by/innlandet/dombas_stasjon_jernbaneknutepunkt/dombas_stasjon_jernbaneknutepunkt.json
- data/places/naeringsliv/innlandet/biri_glassverk_historisk_sted/biri_glassverk_historisk_sted.json
- data/places/by/innlandet/otta_stasjon_gudbrandsdalen/otta_stasjon_gudbrandsdalen.json
- data/places/by/innlandet/kongsvinger_stasjon_grensebanen/kongsvinger_stasjon_grensebanen.json
- data/places/historie/innlandet/places_historie_innlandet_batch15/kvam_krigsminne_1940.json
- data/places/historie/innlandet/places_historie_innlandet_batch15/asnes_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch15/hof_kirke_asnes.json
- data/places/historie/innlandet/places_historie_innlandet_batch15/tolga_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch15/os_kirke_osterdalen.json
- data/places/by/innlandet/elverum_stasjon_jernbanemiljo/elverum_stasjon_jernbanemiljo.json
- data/places/by/innlandet/tynset_stasjon_rorosbanen/tynset_stasjon_rorosbanen.json
- data/places/by/innlandet/moelv_stasjon_mjoslinjen/moelv_stasjon_mjoslinjen.json
- data/places/by/innlandet/stange_stasjon_dovrebanen/stange_stasjon_dovrebanen.json
- data/places/by/innlandet/gran_stasjon_gjovikbanen/gran_stasjon_gjovikbanen.json
- data/places/by/innlandet/lena_stasjon_totenbanen/lena_stasjon_totenbanen.json
- data/places/by/innlandet/reinsvoll_stasjon_totenbanen/reinsvoll_stasjon_totenbanen.json
- data/places/by/innlandet/dokka_stasjon_valdresbanen/dokka_stasjon_valdresbanen.json
- data/places/by/innlandet/skarnes_stasjon_kongsvingerbanen/skarnes_stasjon_kongsvingerbanen.json
- data/places/naeringsliv/innlandet/braskereidfoss_kraftverk/braskereidfoss_kraftverk.json
- data/places/historie/innlandet/places_historie_innlandet_batch17/slidredomen_vestre_slidre.json
- data/places/historie/innlandet/places_historie_innlandet_batch17/bruflat_kirke_etnedal.json
- data/places/historie/innlandet/places_historie_innlandet_batch17/vinger_kirke_kongsvinger.json
- data/places/historie/innlandet/places_historie_innlandet_batch17/grue_finnskog_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch17/furnes_kirke_ringsaker.json
- data/places/historie/innlandet/places_historie_innlandet_batch17/alvdal_kirke.json
- data/places/by/innlandet/skreia_stasjon_totenbanen/skreia_stasjon_totenbanen.json
- data/places/by/innlandet/flisa_stasjon_solorbanen/flisa_stasjon_solorbanen.json
- data/places/historie/innlandet/places_historie_innlandet_batch18/kvikne_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch18/oyer_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch18/tretten_kirke.json
- data/places/historie/innlandet/places_historie_innlandet_batch18/ringebu_prestegard.json
- data/places/historie/innlandet/places_historie_innlandet_batch18/dombas_krigsminne_1940.json
- data/places/litteratur/innlandet/bjorgan_prestegard_kvikne/bjorgan_prestegard_kvikne.json
- data/places/naeringsliv/innlandet/einunna_kraftverk_folldal/einunna_kraftverk_folldal.json
- data/places/by/innlandet/os_stasjon_rorosbanen/os_stasjon_rorosbanen.json
- data/places/historie/vestfold/places_historie_vestfold_batch1/kaupang_bikjholberget.json
- data/places/historie/vestfold/places_historie_vestfold_batch1/oseberghaugen_tonsberg.json
- data/places/historie/vestfold/places_historie_vestfold_batch1/borrerhaugene_midgard.json
- data/places/historie/vestfold/places_historie_vestfold_batch1/slottsfjellet_tonsberg.json
- data/places/historie/vestfold/places_historie_vestfold_batch1/mikaelskirken_slottsfjellet.json
- data/places/historie/vestfold/places_historie_vestfold_batch1/hvalfangstmuseet_sandefjord.json
- data/places/historie/vestfold/places_historie_vestfold_batch1/karljohansvern_horten.json
- data/places/naeringsliv/vestfold/eidsfoss_jernverk/eidsfoss_jernverk.json
- data/places/historie/vestfold/places_historie_vestfold_batch2/gokstadhaugen_sandefjord.json
- data/places/historie/vestfold/places_historie_vestfold_batch2/molen_brunlanes_gravroysfelt.json
- data/places/historie/vestfold/places_historie_vestfold_batch2/istrehagan_steinsetting.json
- data/places/historie/vestfold/places_historie_vestfold_batch2/fredriksvern_verft_stavern.json
- data/places/historie/vestfold/places_historie_vestfold_batch2/herregarden_larvik.json
- data/places/historie/vestfold/places_historie_vestfold_batch2/tjolling_kirke_larvik.json
- data/places/historie/vestfold/places_historie_vestfold_batch2/sem_kirke_tonsberg.json
- data/places/historie/vestfold/places_historie_vestfold_batch2/hedrum_kirke_larvik.json
- data/places/historie/vestfold/places_historie_vestfold_batch3/jarlsberg_hovedgard.json
- data/places/historie/vestfold/places_historie_vestfold_batch3/hoyjord_stavkirke.json
- data/places/historie/vestfold/places_historie_vestfold_batch3/borre_kirke_horten.json
- data/places/historie/vestfold/places_historie_vestfold_batch3/botne_kirke_holmestrand.json
- data/places/historie/vestfold/places_historie_vestfold_batch3/ramnes_kirke_tonsberg.json
- data/places/historie/vestfold/places_historie_vestfold_batch3/vale_kirke_tonsberg.json
- data/places/historie/vestfold/places_historie_vestfold_batch3/sandar_kirke_sandefjord.json
- data/places/historie/vestfold/places_historie_vestfold_batch3/larvik_kirke.json
- data/places/historie/vestfold/places_historie_vestfold_batch4/notteroy_kirke_faerder.json
- data/places/historie/vestfold/places_historie_vestfold_batch4/tjome_kirke_faerder.json
- data/places/historie/vestfold/places_historie_vestfold_batch4/andebu_kirke_sandefjord.json
- data/places/historie/vestfold/places_historie_vestfold_batch4/kodal_kirke_sandefjord.json
- data/places/historie/vestfold/places_historie_vestfold_batch4/stokke_kirke_sandefjord.json
- data/places/historie/vestfold/places_historie_vestfold_batch4/holmestrand_kirke.json
- data/places/historie/vestfold/places_historie_vestfold_batch4/sande_kirke_vestfold.json
- data/places/by/vestfold/faerder_fyr/faerder_fyr.json
- data/places/historie/vestfold/places_historie_vestfold_batch5/marinemuseet_horten.json
- data/places/historie/vestfold/places_historie_vestfold_batch5/norske_love_horten.json
- data/places/historie/vestfold/places_historie_vestfold_batch5/citadellet_stavern.json
- data/places/historie/vestfold/places_historie_vestfold_batch5/minnehallen_stavern.json
- data/places/historie/vestfold/places_historie_vestfold_batch5/tonsberg_domkirke.json
- data/places/naeringsliv/vestfold/fritzoe_verk_larvik/fritzoe_verk_larvik.json
- data/places/by/vestfold/sandefjord_kurbad/sandefjord_kurbad.json
- data/places/naeringsliv/vestfold/vallo_saltverk/vallo_saltverk.json
- data/places/historie/vestfold/places_historie_vestfold_batch6/slottsfjellsmuseet_tonsberg.json
- data/places/historie/vestfold/places_historie_vestfold_batch6/larvik_museum_verksgarden.json
- data/places/historie/vestfold/places_historie_vestfold_batch6/preus_museum_horten.json
- data/places/historie/vestfold/places_historie_vestfold_batch6/tanum_kirke_larvik.json
- data/places/historie/vestfold/places_historie_vestfold_batch6/skjee_kirke_sandefjord.json
- data/places/historie/vestfold/places_historie_vestfold_batch6/hof_kirke_holmestrand.json
- data/places/historie/vestfold/places_historie_vestfold_batch6/svarstad_kirke_lardal.json
- data/places/naeringsliv/vestfold/melsomvik_verft/melsomvik_verft.json
- data/places/historie/vestfold/places_historie_vestfold_batch7/bastoy_skolehjem_horten.json
- data/places/historie/vestfold/places_historie_vestfold_batch7/aluminiummuseet_holmestrand.json
- data/places/historie/vestfold/places_historie_vestfold_batch7/midgard_vikingsenter_horten.json
- data/places/by/vestfold/tollerodden_larvik/tollerodden_larvik.json
- data/places/by/vestfold/horten_stasjon_vestfoldbanen/horten_stasjon_vestfoldbanen.json
- data/places/by/vestfold/tonsberg_stasjon_vestfoldbanen/tonsberg_stasjon_vestfoldbanen.json
- data/places/by/vestfold/sandefjord_stasjon_vestfoldbanen/sandefjord_stasjon_vestfoldbanen.json
- data/places/by/vestfold/larvik_stasjon_vestfoldbanen/larvik_stasjon_vestfoldbanen.json
- data/places/historie/telemark/places_historie_telemark_batch1/heddal_stavkirke.json
- data/places/historie/telemark/places_historie_telemark_batch1/eidsborg_stavkirke.json
- data/places/historie/telemark/places_historie_telemark_batch1/ulefoss_hovedgaard.json
- data/places/historie/telemark/places_historie_telemark_batch1/skien_kirke_byhistorie.json
- data/places/historie/telemark/places_historie_telemark_batch1/brekkeparken_skien.json
- data/places/naeringsliv/telemark/vemork_rjukan_industriarv/vemork_rjukan_industriarv.json
- data/places/by/telemark/telemarkskanalen_vrangfoss/telemarkskanalen_vrangfoss.json
- data/places/naeringsliv/telemark/notodden_industriarv_hydro/notodden_industriarv_hydro.json
- data/places/historie/telemark/places_historie_telemark_batch2/porsgrunn_kirke_byhistorie.json
- data/places/historie/telemark/places_historie_telemark_batch2/bo_gamle_kyrkje.json
- data/places/historie/telemark/places_historie_telemark_batch2/sauherad_kirke_midt_telemark.json
- data/places/historie/telemark/places_historie_telemark_batch2/seljord_kirke.json
- data/places/historie/telemark/places_historie_telemark_batch2/kviteseid_gamle_kyrkje.json
- data/places/by/telemark/rjukanbanen_rjukan_stasjon/rjukanbanen_rjukan_stasjon.json
- data/places/by/telemark/tinnoset_stasjon_tinnosbanen/tinnoset_stasjon_tinnosbanen.json
- data/places/naeringsliv/telemark/porsgrund_porselensfabrik/porsgrund_porselensfabrik.json
- data/places/historie/telemark/places_historie_telemark_batch3/vest_telemark_museum_eidsborg.json
- data/places/historie/telemark/places_historie_telemark_batch3/gjerpen_kirke_skien.json
- data/places/historie/telemark/places_historie_telemark_batch3/eidanger_kirke_porsgrunn.json
- data/places/historie/telemark/places_historie_telemark_batch3/bamble_kirke.json
- data/places/historie/telemark/places_historie_telemark_batch3/kragero_kirke_byhistorie.json
- data/places/scenekunst/oslo/places_scenekunst/nationaltheatret.json
- data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json
- data/places/scenekunst/oslo/places_scenekunst/chat_noir.json
- data/places/scenekunst/oslo/places_scenekunst/edderkoppen_scene.json
- data/places/scenekunst/oslo/places_scenekunst/latter.json
- data/places/scenekunst/oslo/places_scenekunst/folketeateret.json
- data/places/scenekunst/oslo/places_scenekunst/operahuset.json
- data/places/scenekunst/oslo/places_scenekunst/black_box_teater.json
- data/places/scenekunst/oslo/places_scenekunst/dansens_hus_oslo.json
- data/places/scenekunst/oslo/places_scenekunst/riksscenen.json
- data/places/scenekunst/oslo/places_scenekunst/oslo_nye_teater_hovedscenen.json
- data/places/scenekunst/oslo/places_scenekunst/det_andre_teatret.json
- data/places/scenekunst/oslo/places_scenekunst/nordic_black_theatre_cafeteatret.json
- data/places/scenekunst/oslo/places_scenekunst/centralteatret.json
- data/places/scenekunst/oslo/places_scenekunst/kloden_teater_pilotscenen.json
- data/places/scenekunst/oslo/places_scenekunst/grusomhetens_teater.json
- data/places/scenekunst/oslo/places_scenekunst/rommen_scene.json
- data/places/scenekunst/oslo/places_scenekunst/salt_oslo.json
- data/places/scenekunst/oslo/places_scenekunst/det_andre_teatret_intimscenen.json
- data/places/sport/europa/norway/telemark/morgedal_norsk_skieventyr/morgedal_norsk_skieventyr.json
- data/places/naeringsliv/telemark/dalen_hotel_tokke/dalen_hotel_tokke.json
- data/places/naeringsliv/telemark/ovre_verket_ulefoss/ovre_verket_ulefoss.json
- data/places/historie/telemark/places_historie_telemark_batch4/holla_kirkeruin_ulefoss.json
- data/places/historie/telemark/places_historie_telemark_batch4/romnes_kirke_nome.json
- data/places/historie/telemark/places_historie_telemark_batch4/langesund_kirke_byhistorie.json
- data/places/naeringsliv/telemark/svelgfoss_kraftverk_notodden/svelgfoss_kraftverk_notodden.json
- data/places/by/telemark/brevik_byhistorie_tollbod/brevik_byhistorie_tollbod.json
- data/places/by/telemark/lunde_sluse_telemarkskanalen/lunde_sluse_telemarkskanalen.json
- data/places/by/telemark/kjeldal_sluse_telemarkskanalen/kjeldal_sluse_telemarkskanalen.json
- data/places/by/telemark/hogga_sluse_telemarkskanalen/hogga_sluse_telemarkskanalen.json
- data/places/historie/telemark/places_historie_telemark_batch5/hjartdal_kirke.json
- data/places/historie/telemark/places_historie_telemark_batch5/drangedal_kirke.json
- data/places/historie/telemark/places_historie_telemark_batch5/nissedal_kyrkje.json
- data/places/by/telemark/mael_stasjon_rjukanbanen/mael_stasjon_rjukanbanen.json
- data/places/by/telemark/df_ammonia_mael/df_ammonia_mael.json
- data/places/by/telemark/notodden_stasjon_industriarv/notodden_stasjon_industriarv.json
- data/places/naeringsliv/telemark/skotfoss_bruk_skien/skotfoss_bruk_skien.json
- data/places/naeringsliv/telemark/heroya_industripark_porsgrunn/heroya_industripark_porsgrunn.json
- data/places/historie/telemark/places_historie_telemark_batch6/vinje_kyrkje.json
- data/places/historie/telemark/places_historie_telemark_batch6/rauland_kyrkje.json
- data/places/historie/telemark/places_historie_telemark_batch6/fyresdal_kyrkje.json
- data/places/naeringsliv/telemark/saheim_kraftverk_rjukan/saheim_kraftverk_rjukan.json
- data/places/naeringsliv/telemark/tinfos_industrimiljo_notodden/tinfos_industrimiljo_notodden.json
- data/places/politikk/telemark/menstad_bru_menstadslaget/menstad_bru_menstadslaget.json
- data/places/naeringsliv/telemark/klosteroya_union_skien/klosteroya_union_skien.json
- data/places/litteratur/telemark/ibsen_venstop_skien/ibsen_venstop_skien.json
- data/places/historie/telemark/places_historie_telemark_batch7/gunnarsholmen_kystfort_kragero.json
- data/places/historie/telemark/places_historie_telemark_batch7/tinn_museum_austbygde.json
- data/places/historie/telemark/places_historie_telemark_batch7/atra_kirke_tinn.json
- data/places/historie/telemark/places_historie_telemark_batch7/mo_kyrkje_tokke.json
- data/places/historie/telemark/places_historie_telemark_batch7/skafsa_kyrkje_tokke.json
- data/places/by/telemark/kragero_stasjon_kragerobanen/kragero_stasjon_kragerobanen.json
- data/places/by/telemark/treungen_stasjon_treungenbanen/treungen_stasjon_treungenbanen.json
- data/places/by/telemark/bo_stasjon_sorlandsbanen/bo_stasjon_sorlandsbanen.json
- data/places/historie/agder/places_historie_agder_batch1/christiansholm_festning_kristiansand.json
- data/places/historie/agder/places_historie_agder_batch1/bykle_gamle_kyrkje.json
- data/places/historie/agder/places_historie_agder_batch1/setesdalsmuseet_rysstad.json
- data/places/by/agder/kristiansand_domkirke_byhistorie/kristiansand_domkirke_byhistorie.json
- data/places/naeringsliv/agder/nes_jernverk_tvedestrand/nes_jernverk_tvedestrand.json
- data/places/by/agder/ny_hellesund_uthavn_sogne/ny_hellesund_uthavn_sogne.json
- data/places/by/agder/lindesnes_fyr/lindesnes_fyr.json
- data/places/naeringsliv/agder/knaben_gruver_kvinesdal/knaben_gruver_kvinesdal.json
- data/places/historie/agder/places_historie_agder_batch2/kuben_aust_agder_museum.json
- data/places/historie/agder/places_historie_agder_batch2/fjaere_kirke_grimstad.json
- data/places/historie/agder/places_historie_agder_batch2/mollenborg_kanonmuseum_kristiansand.json
- data/places/by/agder/mandal_kirke_byhistorie/mandal_kirke_byhistorie.json
- data/places/by/agder/tyholmen_arendal_byhistorie/tyholmen_arendal_byhistorie.json
- data/places/by/agder/grimstad_byhistorie_og_havn/grimstad_byhistorie_og_havn.json
- data/places/litteratur/agder/ibsen_museet_grimstad/ibsen_museet_grimstad.json
- data/places/naeringsliv/agder/sjolingstad_ullvarefabrikk/sjolingstad_ullvarefabrikk.json
- data/places/by/agder/risor_trehusby_byhistorie/risor_trehusby_byhistorie.json
- data/places/by/agder/tvedestrand_byhistorie_og_havn/tvedestrand_byhistorie_og_havn.json
- data/places/by/agder/flekkefjord_hollenderbyen/flekkefjord_hollenderbyen.json
- data/places/by/agder/farsund_byhistorie_havn/farsund_byhistorie_havn.json
- data/places/by/agder/lista_fyr/lista_fyr.json
- data/places/historie/agder/lista_museum_vanse/lista_museum_vanse.json
- data/places/historie/agder/odderoya_militaerhistorie_kristiansand/odderoya_militaerhistorie_kristiansand.json
- data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand/bredalsholmen_dokk_kristiansand.json
- data/places/historie/agder/stiftelsen_arkivet_kristiansand/stiftelsen_arkivet_kristiansand.json
- data/places/historie/agder/gimle_gard_kristiansand/gimle_gard_kristiansand.json
- data/places/by/agder/setesdalsbanen_grovane/setesdalsbanen_grovane.json
- data/places/naeringsliv/agder/hunsfos_fabrikker_vennesla/hunsfos_fabrikker_vennesla.json
- data/places/naeringsliv/agder/flot_gruve_evje/flot_gruve_evje.json
- data/places/by/agder/lyngor_uthavn_tvedestrand/lyngor_uthavn_tvedestrand.json
- data/places/historie/agder/dypvag_kirke_tvedestrand/dypvag_kirke_tvedestrand.json
- data/places/historie/agder/tromoy_kirke_arendal/tromoy_kirke_arendal.json
- data/places/by/agder/posebyen_kristiansand_trehusby/posebyen_kristiansand_trehusby.json
- data/places/historie/agder/oddernes_kirke_kristiansand/oddernes_kirke_kristiansand.json
- data/places/historie/agder/sogne_gamle_kirke_kristiansand/sogne_gamle_kirke_kristiansand.json
- data/places/by/agder/lillesand_byhistorie_og_havn/lillesand_byhistorie_og_havn.json
- data/places/by/agder/merdo_uthavn_arendal/merdo_uthavn_arendal.json
- data/places/natur/agder/bragdoya_kystkultursenter/bragdoya_kystkultursenter.json
- data/places/by/agder/ryvingen_fyr_mandal/ryvingen_fyr_mandal.json
- data/places/naeringsliv/agder/froland_verk/froland_verk.json
- data/places/historie/agder/hylestad_gamle_kyrkjegard/hylestad_gamle_kyrkjegard.json
- data/places/historie/agder/valle_kyrkje_setesdal/valle_kyrkje_setesdal.json
- data/places/historie/agder/bygland_museum/bygland_museum.json
- data/places/historie/agder/spangereid_kirke_lindesnes/spangereid_kirke_lindesnes.json
- data/places/by/agder/flekkefjordbanen_sira/flekkefjordbanen_sira.json
- data/places/historie/agder/bakke_kirke_flekkefjord/bakke_kirke_flekkefjord.json
- data/places/historie/agder/mandal_museum_andorsengarden/mandal_museum_andorsengarden.json
- data/places/historie/agder/ds_hestmanden_kristiansand/ds_hestmanden_kristiansand.json
- data/places/historie/agder/holt_kirke_tvedestrand/holt_kirke_tvedestrand.json
- data/places/naeringsliv/agder/egeland_verk_gjerstad/egeland_verk_gjerstad.json
- data/places/naeringsliv/agder/boylefoss_kraftverk_froland/boylefoss_kraftverk_froland.json
- data/places/historie/agder/amli_kirke/amli_kirke.json
- data/places/historie/agder/evjemoen_leir_evje/evjemoen_leir_evje.json
- data/places/historie/agder/hornnes_kirke/hornnes_kirke.json
- data/places/historie/agder/lyngdal_kirke/lyngdal_kirke.json
- data/places/historie/agder/hidra_kirke_flekkefjord/hidra_kirke_flekkefjord.json
- data/places/by/agder/arendal_gamle_radhus/arendal_gamle_radhus.json
- data/places/by/agder/kristiansand_gamle_tollbod/kristiansand_gamle_tollbod.json
- data/places/by/agder/oksoy_fyr_kristiansand/oksoy_fyr_kristiansand.json
- data/places/by/agder/gronningen_fyr_kristiansand/gronningen_fyr_kristiansand.json
- data/places/historie/agder/gjerstad_kirke/gjerstad_kirke.json
- data/places/historie/agder/kvinesdal_kirke/kvinesdal_kirke.json
- data/places/historie/agder/feda_kirke_kvinesdal/feda_kirke_kvinesdal.json
- data/places/historie/agder/haegebostad_kirke/haegebostad_kirke.json
- data/places/by/agder/risor_kirke_byhistorie/risor_kirke_byhistorie.json
- data/places/historie/agder/sondeled_kirke_risor/sondeled_kirke_risor.json
- data/places/historie/agder/vegarshei_kirke/vegarshei_kirke.json
- data/places/historie/agder/birkenes_kirke/birkenes_kirke.json
- data/places/historie/agder/iveland_kirke/iveland_kirke.json
- data/places/historie/agder/eiken_kirke_haegebostad/eiken_kirke_haegebostad.json
- data/places/historie/agder/konsmo_kirke_lyngdal/konsmo_kirke_lyngdal.json
- data/places/historie/agder/tonstad_kirke_sirdal/tonstad_kirke_sirdal.json
- data/places/historie/agder/vestre_moland_kirke_lillesand/vestre_moland_kirke_lillesand.json
- data/places/historie/agder/hovag_kirke_lillesand/hovag_kirke_lillesand.json
- data/places/historie/agder/herefoss_kirke_birkenes/herefoss_kirke_birkenes.json
- data/places/historie/agder/mykland_kirke_froland/mykland_kirke_froland.json
- data/places/by/agder/dampskipet_bjoren_bygland/dampskipet_bjoren_bygland.json
- data/places/historie/agder/nordberg_fort_lista/nordberg_fort_lista.json
- data/places/historie/agder/flekkefjord_museum/flekkefjord_museum.json
- data/places/historie/agder/lillesand_by_og_sjofartsmuseum/lillesand_by_og_sjofartsmuseum.json
- data/places/by/agder/torungen_fyr_arendal/torungen_fyr_arendal.json
- data/places/by/agder/homborsund_fyr_grimstad/homborsund_fyr_grimstad.json
- data/places/by/agder/nelaug_stasjon_amli/nelaug_stasjon_amli.json
- data/places/by/agder/lillesand_flaksvandbanen/lillesand_flaksvandbanen.json
- data/places/by/agder/kristiansand_stasjon/kristiansand_stasjon.json
- data/places/vitenskap/agder/agder_naturmuseum_kristiansand/agder_naturmuseum_kristiansand.json
- data/places/naeringsliv/agder/bomuldsfabriken_arendal/bomuldsfabriken_arendal.json
- data/places/by/agder/lista_flystasjon_farsund/lista_flystasjon_farsund.json
- data/places/historie/agder/oyestad_kirke_arendal/oyestad_kirke_arendal.json
- data/places/historie/agder/austre_moland_kirke_arendal/austre_moland_kirke_arendal.json
- data/places/by/agder/grimstad_kirke_byhistorie/grimstad_kirke_byhistorie.json
- data/places/by/agder/arendal_stasjon/arendal_stasjon.json
- data/places/by/agder/grimstad_stasjon_grimstadbanen/grimstad_stasjon_grimstadbanen.json
- data/places/naeringsliv/agder/tonstad_kraftverk_sirdal/tonstad_kraftverk_sirdal.json
- data/places/vitenskap/agder/kristiansand_katedralskole/kristiansand_katedralskole.json
- data/places/historie/agder/lund_batteri_kristiansand/lund_batteri_kristiansand.json
- data/places/by/agder/trefoldighetskirken_arendal/trefoldighetskirken_arendal.json
- data/places/historie/agder/flosta_kirke_arendal/flosta_kirke_arendal.json
- data/places/historie/agder/landvik_kirke_grimstad/landvik_kirke_grimstad.json
- data/places/historie/agder/eide_kirke_grimstad/eide_kirke_grimstad.json
- data/places/historie/agder/vanse_kirke_farsund/vanse_kirke_farsund.json
- data/places/by/agder/farsund_kirke_byhistorie/farsund_kirke_byhistorie.json
- data/places/by/agder/flekkefjord_kirke_byhistorie/flekkefjord_kirke_byhistorie.json
- data/places/natur/agder/justoy_kystkultur_lillesand/justoy_kystkultur_lillesand.json
- data/places/historie/agder/tingvatn_fornminnepark_haegebostad/tingvatn_fornminnepark_haegebostad.json
- data/places/historie/agder/rygnestadtunet_valle/rygnestadtunet_valle.json
- data/places/natur/agder/ravnedalen_kristiansand/ravnedalen_kristiansand.json
- data/places/historie/agder/vest_agder_museet_kongsgard/vest_agder_museet_kongsgard.json
- data/places/by/agder/fullriggeren_sorlandet_kristiansand/fullriggeren_sorlandet_kristiansand.json
- data/places/by/agder/spangereidkanalen_lindesnes/spangereidkanalen_lindesnes.json
- data/places/naeringsliv/agder/pusnes_mekaniske_verksted_arendal/pusnes_mekaniske_verksted_arendal.json
- data/places/by/agder/arendal_tollbod/arendal_tollbod.json
- data/places/historie/agder/vigeland_hovedgard_lindesnes/vigeland_hovedgard_lindesnes.json
- data/places/natur/agder/furulunden_mandal_kulturpark/furulunden_mandal_kulturpark.json
- data/places/historie/agder/kristiansand_kanonmuseum_movik/kristiansand_kanonmuseum_movik.json
- data/places/vitenskap/agder/evje_mineralsti/evje_mineralsti.json
- data/places/vitenskap/agder/setesdal_mineralpark_evje/setesdal_mineralpark_evje.json
- data/places/kunst/agder/valle_sylvsmie_handverkshistorie/valle_sylvsmie_handverkshistorie.json
- data/places/historie/agder/risor_museum/risor_museum.json
- data/places/historie/agder/arendal_sjofartsmuseum/arendal_sjofartsmuseum.json
- data/places/historie/agder/boen_gard_kristiansand/boen_gard_kristiansand.json
- data/places/historie/agder/sogne_gamle_prestegard/sogne_gamle_prestegard.json
- data/places/by/agder/kristiansand_lufthavn_kjevik/kristiansand_lufthavn_kjevik.json
- data/places/by/agder/hollen_brygge_sogne/hollen_brygge_sogne.json
- data/places/natur/agder/skjernoy_kystkultur_lindesnes/skjernoy_kystkultur_lindesnes.json
- data/places/historie/agder/byremo_tingsted_lyngdal/byremo_tingsted_lyngdal.json
- data/places/kunst/agder/arendal_kulturhus/arendal_kulturhus.json
- data/places/historie/agder/lindesnes_bygdemuseum/lindesnes_bygdemuseum.json
- data/places/scenekunst/agder/kilden_teater_konserthus_kristiansand/kilden_teater_konserthus_kristiansand.json
- data/places/by/agder/fiskebrygga_kristiansand/fiskebrygga_kristiansand.json
- data/places/natur/agder/baneheia_kristiansand_bypark/baneheia_kristiansand_bypark.json
- data/places/vitenskap/agder/dommesmoen_grimstad/dommesmoen_grimstad.json
- data/places/naeringsliv/agder/laudal_kraftverk_lindesnes/laudal_kraftverk_lindesnes.json
- data/places/naeringsliv/agder/brokke_kraftverk_valle/brokke_kraftverk_valle.json
- data/places/naeringsliv/agder/holen_kraftverk_bykle/holen_kraftverk_bykle.json
- data/places/by/agder/audnedal_stasjon_lyngdal/audnedal_stasjon_lyngdal.json
- data/places/historie/norge/places_historie_norge_for_1500_batch1/hafrsfjord.json
- data/places/historie/norge/places_historie_norge_for_1500_batch1/avaldsnes_kongsgard.json
- data/places/historie/norge/places_historie_norge_for_1500_batch1/stiklestad.json
- data/places/historie/norge/places_historie_norge_for_1500_batch1/nidarosdomen.json
- data/places/historie/norge/places_historie_norge_for_1500_batch1/lade_gard.json
- data/places/historie/norge/places_historie_norge_for_1500_batch1/bergenhus_haakonshallen.json
- data/places/historie/norge/places_historie_norge_for_1500_batch1/tonsberg_slottsfjell.json
- data/places/historie/norge/places_historie_norge_for_1500_batch1/moster_gamle_kyrkje.json
- data/places/historie/norge/places_historie_norge_for_1500_batch1/sola_erling_skjalgsson.json
- data/places/historie/norge/places_historie_norge_for_1500_batch1/reinskloster.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2/stein_ringerike_halvdanshaugen.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2/fitjar_hakonarparken.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2/hjorungavag.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2/rimol_melhus.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2/bjarkoy_tore_hund.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2/egge_gard_steinkjer.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2/giske_kyrkje.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2/hallvardskirken_oslo.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2/munkeliv_kloster.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2/audunborg_hegrenes.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2/varteig_kirke.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2/elgeseter_kloster.json
- data/places/historie/norge/places_historie_norge_for_1500_batch2/talgje_kyrkje.json
- data/places/politikk/vestland/gulatinget_flolid/gulatinget_flolid.json
- data/places/by/vestland/nordnes_bergen/nordnes_bergen.json
- data/places/historie/norge/places_historie_norge_for_1500_batch3/nidaros_erkebispegarden.json
- data/places/historie/norge/places_historie_norge_for_1500_batch3/kristkirken_bergenhus.json
- data/places/historie/norge/places_historie_norge_for_1500_batch3/hakonshella_bauta.json
- data/places/historie/norge/places_historie_norge_for_1500_batch3/kalvskinnet_slagsted.json
- data/places/historie/norge/places_historie_norge_for_1500_batch3/fimreite_slagsted.json
- data/places/historie/norge/places_historie_norge_for_1500_batch3/sekken_slagsted.json
- data/places/historie/norge/places_historie_norge_for_1500_batch3/re_slagsted_ramnes.json
- data/places/historie/norge/places_historie_norge_for_1500_batch3/bratsberg_gard.json
- data/places/historie/norge/places_historie_norge_for_1500_batch3/bohus_festning_bagaholmen.json
- data/places/historie/norge/places_historie_norge_for_1500_batch3/kalmar_slott.json
- data/places/politikk/trondelag/frostatinget_logtun/frostatinget_logtun.json
- data/places/by/nordland/vagar_lofoten_storvagan/vagar_lofoten_storvagan.json
- data/places/historie/norge/places_historie_norge_for_1500_batch4/downpatrick_magnus_berrfott.json
- data/places/historie/norge/places_historie_norge_for_1500_batch4/holmengra_hvaler.json
- data/places/historie/norge/places_historie_norge_for_1500_batch4/stamford_bridge_battlefield.json
- data/places/historie/norge/places_historie_norge_for_1500_batch4/jelling_kongsgard.json
- data/places/historie/norge/places_historie_norge_for_1500_batch4/orkney_birsay.json
- data/places/by/utland_england/york_jorvik/york_jorvik.json
- data/places/kunst/oslo/places_kunst/nasjonalmuseet.json
- data/places/kunst/oslo/places_kunst/munch_museet.json
- data/places/kunst/oslo/places_kunst/astrup_fearnley.json
- data/places/kunst/oslo/places_kunst/ekebergparken.json
- data/places/kunst/oslo/places_kunst/emanuel_vigeland_mausoleum.json
- data/places/kunst/oslo/places_kunst/framtidsbiblioteket_nordmarka.json
- data/places/litteratur/akershus/alf_proysen_statue_nittedal.json
- data/places/litteratur/oslo/places_litteratur/ibsen_quotes.json
- data/places/litteratur/oslo/places_litteratur/nasjonalbiblioteket.json
- data/places/litteratur/oslo/places_litteratur/camilla_collett_statue.json
- data/places/litteratur/oslo/places_litteratur/henrik_wergeland_statue.json
- data/places/litteratur/oslo/places_litteratur/grotta.json
- data/places/litteratur/oslo/places_litteratur/litteraturhuset.json
- data/places/litteratur/oslo/places_litteratur/tronsmo_bokhandel.json
- data/places/litteratur/oslo/places_litteratur/eldorado_bokhandel.json
- data/places/litteratur/oslo/places_litteratur/gamle_deichman.json
- data/places/litteratur/oslo/places_litteratur/deichman_grunerlokka.json
- data/places/litteratur/oslo/places_litteratur/kulturkirken_jakob_litteratur.json
- data/places/litteratur/oslo/places_litteratur/norli_universitetsgata.json
- data/places/litteratur/oslo/places_litteratur/sigrid_undset_statue.json
- data/places/litteratur/oslo/places_litteratur/ruth_maier_minne.json
- data/places/litteratur/oslo/places_litteratur/inger_hagerups_plass.json
- data/places/litteratur/oslo/places_litteratur/oscar_braaten_statuen.json
- data/places/litteratur/oslo/places_litteratur/alexander_kiellands_plass.json
- data/places/media/oslo/places_oslo_media/vg_huset.json
- data/places/media/oslo/places_oslo_media/nrk_huset_marienlyst.json
- data/places/media/oslo/places_oslo_media/aftenposten_akersgata.json
- data/places/media/oslo/places_oslo_media/dagbladet_akersgata.json
- data/places/media/oslo/places_oslo_media/klassekampen_redaksjon.json
- data/places/musikk/oslo/places_musikk/salt.json
- data/places/musikk/oslo/places_musikk/blaa.json
- data/places/musikk/oslo/places_musikk/rockefeller.json
- data/places/musikk/oslo/places_musikk/john_dee.json
- data/places/musikk/oslo/places_musikk/sentrum_scene.json
- data/places/naeringsliv/oslo/places_naeringsliv/oslo_gassverk.json
- data/places/naeringsliv/oslo/places_naeringsliv/havnelageret.json
- data/places/naeringsliv/oslo/places_naeringsliv/tollbukaia.json
- data/places/naeringsliv/oslo/places_naeringsliv/oslo_posthus.json
- data/places/naeringsliv/oslo/places_naeringsliv/telegrafbygningen.json
- data/places/naeringsliv/oslo/places_naeringsliv/vinmonopolet_lager.json
- data/places/naeringsliv/oslo/places_naeringsliv/jernbaneverkstedet_lodalen.json
- data/places/naeringsliv/oslo/places_naeringsliv/grunnlovsbygget_bankplassen.json
- data/places/naeringsliv/oslo/places_naeringsliv/akershus_kaier.json
- data/places/naeringsliv/oslo/places_naeringsliv/ulven_handelspark.json
- data/places/naeringsliv/oslo/places_naeringsliv/ovre_foss.json
- data/places/naeringsliv/oslo/places_naeringsliv/oslo_mek.json
- data/places/naeringsliv/oslo/places_naeringsliv/schous_bryggeri.json
- data/places/naeringsliv/oslo/places_naeringsliv/ringnes_bryggeri.json
- data/places/naeringsliv/oslo/places_naeringsliv/st_halvard_bryggeri.json
- data/places/naeringsliv/oslo/places_naeringsliv/oslo_kornmagasin.json
- data/places/naeringsliv/oslo/places_naeringsliv/akershus_slott_bakeriet.json
- data/places/naeringsliv/oslo/places_naeringsliv/oslo_kraftselskap.json
- data/places/naeringsliv/oslo/places_naeringsliv/grensen_kjopesenter.json
- data/places/naeringsliv/oslo/places_naeringsliv/vippetangen_fisketorg.json
- data/places/naeringsliv/oslo/places_naeringsliv/frysja_industriomrade.json
- data/places/naeringsliv/oslo/places_naeringsliv/norges_varemesse.json
- data/places/naeringsliv/oslo/places_naeringsliv/bryn_industriomrade.json
- data/places/naeringsliv/oslo/places_naeringsliv/gronlikaia.json
- data/places/naeringsliv/oslo/places_naeringsliv/myrens_verksted.json
- data/places/naeringsliv/oslo/places_naeringsliv/christiania_seildugsfabrik.json
- data/places/naeringsliv/oslo/places_naeringsliv/lilleborg_fabrikker.json
- data/places/natur/oslo/places_oslo_alna/alnaelva.json
- data/places/natur/oslo/places_oslo_alna/alnaelvstien.json
- data/places/natur/oslo/places_oslo_alna/trosterud_friomrade.json
- data/places/natur/oslo/places_oslo_alna/furuset_haugerud_skogbelte.json
- data/places/natur/oslo/places_oslo_alna/hellerud_gard.json
- data/places/natur/oslo/places_oslo_alna/alnabru_jernbane_og_logistikk.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/frysjadammen.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/seilduksfabrikken_nydalen.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/nydalsdammen.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/stilla_nydalen.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/bjoelsenfossen.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/bjoelsenparken_elvenaer.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/glads_molle.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/voienfossen.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/voien_gard_voienvolden.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/myralokka.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/kuba_parken.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/beierbrua.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/nedre_foss.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/vulkan_industriomrade.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/elvestrekning_bla_brenneriveien.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/fossveien_elvestrekning.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/hausmannsbrua.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/hausmannsomradet_elvelop.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/ankerbrua.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/nybrua_vaterlandsparken.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/vaterlandsparken.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/vaterland_historisk_elvelop.json
- data/places/natur/oslo/places_oslo_natur_akerselvarute/akerselva_utlop_bjorvika.json
- data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alnsjoen_alna_kilde.json
- data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alnaparken.json
- data/places/natur/oslo/places_oslo_natur_alnaelva_rute/groruddammen.json
- data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alna_smalvoll.json
- data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alna_bryn.json
- data/places/natur/oslo/places_oslo_natur_alnaelva_rute/svartdalen.json
- data/places/natur/oslo/places_oslo_natur_alnaelva_rute/kvaernerbyen_alna.json
- data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alna_utlop_bjorvika.json
- data/places/natur/oslo/places_oslo_natur_bygdoy/bygdoy_kongeskogen.json
- data/places/natur/oslo/places_oslo_natur_bygdoy/bygdoy_dronningberget.json
- data/places/natur/oslo/places_oslo_natur_bygdoy/bygdoy_huk.json
- data/places/natur/oslo/places_oslo_natur_bygdoy/bygdoy_paradisbukta.json
- data/places/natur/oslo/places_oslo_natur_bygdoy/bygdoy_bygdoynes.json
- data/places/natur/oslo/places_oslo_natur_hovedsteder/ostensjovannet.json
- data/places/natur/oslo/places_oslo_natur_hovedsteder/hovedoya.json
- data/places/natur/oslo/places_oslo_natur_hovedsteder/gressholmen.json
- data/places/natur/oslo/places_oslo_natur_hovedsteder/bygdoy_natur.json
- data/places/natur/oslo/places_oslo_natur_hovedsteder/ljanselva.json
- data/places/natur/oslo/places_oslo_natur_hovedsteder/maerradalen.json
- data/places/natur/oslo/places_oslo_natur_hovedsteder/maridalsvannet.json
- data/places/natur/oslo/places_oslo_natur_hovedsteder/noklevann.json
- data/places/natur/oslo/places_oslo_natur_hovedsteder/alnaelva_hovedsteder.json
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute/noklevann_ljanselva_start.json
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute/skraperudtjern.json
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_skullerud.json
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_hauketo.json
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_ljan.json
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_fiskevollen.json
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_bunnefjorden.json
- data/places/natur/oslo/places_oslo_natur_ostensjovannet/ostensjovannet_nord.json
- data/places/natur/oslo/places_oslo_natur_ostensjovannet/ostensjovannet_fugletarn.json
- data/places/natur/oslo/places_oslo_natur_ostensjovannet/ostensjovannet_sivbelte.json
- data/places/natur/oslo/places_oslo_natur_ostensjovannet/ostensjovannet_sor.json
- data/places/natur/oslo/places_oslo_natur_ostensjovannet/bogerudmyra.json
- data/places/natur/oslo/places_oslo_natur_salamanderdammer/bygdoy_kongsgard_salamanderdam.json
- data/places/natur/oslo/places_oslo_natur_salamanderdammer/bantjern_salamanderlokalitet.json
- data/places/natur/oslo/places_oslo_natur_salamanderdammer/blindern_forskningsparken_salamanderdam.json
- data/places/politikk/oslo/places_politikk/stortinget.json
- data/places/politikk/oslo/places_politikk/youngstorget.json
- data/places/politikk/oslo/places_politikk/oslo_radhus.json
- data/places/politikk/oslo/places_politikk/eidsvolls_plass.json
- data/places/politikk/oslo/places_politikk/tinghuset.json
- data/places/politikk/oslo/places_politikk/regjeringskvartalet.json
- data/places/politikk/oslo/places_politikk/hoyesteretts_hus.json
- data/places/politikk/oslo/places_politikk/politihuset_gronland.json
- data/places/politikk/oslo/places_politikk/folkets_hus_oslo.json
- data/places/politikk/oslo/places_politikk/22_juli_senteret.json
- data/places/politikk/oslo/places_politikk/hoyblokka.json
- data/places/politikk/oslo/places_politikk/y_blokka.json
- data/places/politikk/oslo/places_politikk/victoria_terrasse.json
- data/places/politikk/oslo/places_politikk/statsministerboligen.json
- data/places/politikk/oslo/places_politikk/hoyres_hus.json
- data/places/politikk/oslo/places_politikk/arbeidersamfunnets_plass.json
- data/places/sport/europa/norway/oslo_sport/bislett_stadion.json
- data/places/sport/europa/norway/oslo_sport/ullevaal_stadion.json
- data/places/sport/europa/norway/oslo_sport/intility_arena.json
- data/places/sport/europa/norway/oslo_sport/jordal_amfi.json
- data/places/sport/europa/norway/oslo_sport/holmenkollen_nasjonalanlegg.json
- data/places/sport/europa/norway/oslo_sport/frogner_stadion.json
- data/places/sport/europa/norway/oslo_sport/valle_hovin_stadion.json
- data/places/sport/europa/norway/oslo_sport/daelenenga_idrettspark.json
- data/places/sport/europa/norway/oslo_sport/gressbanen.json
- data/places/sport/europa/norway/oslo_sport/ekebergsletta.json
- data/places/sport/europa/norway/oslo_sport/kfum_arena.json
- data/places/sport/europa/norway/oslo_sport/nordre_aasen_idrettspark.json
- data/places/sport/europa/norway/oslo_sport/vallhall_arena.json
- data/places/sport/europa/norway/oslo_sport/manglerudhallen.json
- data/places/sport/europa/norway/oslo_sport/furuset_forum.json
- data/places/sport/europa/norway/places_oslo_lekeplasser_trening/korketrekkeren.json
- data/places/sport/europa/norway/urban_movement/verdensparken_parkour/verdensparken_parkour.json
- data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark/furuset_aktivitetspark.json
- data/places/sport/europa/norway/places_motorsport_ostlandet/rudskogen_motorsenter.json
- data/places/sport/europa/norway/places_motorsport_ostlandet/valerbanen.json
- data/places/sport/europa/norway/places_motorsport_ostlandet/gardermoen_raceway.json
- data/places/sport/europa/norway/places_motorsport_ostlandet/gardermoen_motorpark.json
- data/places/sport/europa/norway/places_motorsport_ostlandet/grenland_motorsportsenter.json
- data/places/sport/europa/norway/places_motorsport_ostlandet/varna_kartring.json
- data/places/sport/europa/norway/places_motorsport_ostlandet/naf_gokartsenter_andebu.json
- data/places/sport/europa/norway/places_motorsport_ostlandet/kongsberg_motorsenter.json
- data/places/sport/europa/norway/places_motorsport_ostlandet/finnskogbanen.json
- data/places/sport/europa/norway/places_motorsport_ostlandet/momarken_bilbane.json
- data/places/sport/europa/norway/places_motorsport_ostlandet/lyngasbanen.json
- data/places/sport/europa/england/footballgrounds_london/wembley_stadium_london.json
- data/places/sport/europa/england/footballgrounds_london/tottenham_hotspur_stadium_london.json
- data/places/sport/europa/england/footballgrounds_london/emirates_stadium_london.json
- data/places/sport/europa/england/footballgrounds_london/stamford_bridge_london.json
- data/places/sport/europa/england/footballgrounds_london/london_stadium_london.json
- data/places/sport/europa/england/footballgrounds_london/craven_cottage_london.json
- data/places/sport/europa/england/footballgrounds_london/selhurst_park_london.json
- data/places/sport/europa/england/footballgrounds_london/the_den_london.json
- data/places/sport/europa/england/footballgrounds_london/loftus_road_london.json
- data/places/sport/europa/england/footballgrounds_london/gtech_community_stadium_london.json
- data/places/sport/europa/england/footballgrounds_london/the_valley_london.json
- data/places/sport/europa/england/footballgrounds_london/plough_lane_london.json
- data/places/subkultur/oslo/places_subkultur/hausmania.json
- data/places/subkultur/oslo/places_subkultur/skur13.json
- data/places/subkultur/oslo/places_subkultur/torggata_blad.json
- data/places/subkultur/oslo/places_subkultur/stovnertarnet.json
- data/places/subkultur/oslo/places_subkultur/bla.json
- data/places/subkultur/oslo/places_subkultur/vulkan_murvegger.json
- data/places/subkultur/oslo/places_subkultur/hausmannsgate_aksen.json
- data/places/subkultur/oslo/places_subkultur/kolstadgata_toyen_vegger.json
- data/places/subkultur/oslo/places_subkultur/gronland_underganger.json
- data/places/subkultur/oslo/places_subkultur/nybrua_pilarrom.json
- data/places/subkultur/oslo/places_subkultur/schweigaards_gate_lodalen.json
- data/places/subkultur/oslo/places_subkultur/kuba_akselpassasjer.json
- data/places/subkultur/oslo/places_subkultur/grunerlokka_bakgardsvegger.json
- data/places/subkultur/oslo/places_subkultur/blitzhuset.json
- data/places/subkultur/oslo/places_subkultur/kafe_haerverk.json
- data/places/subkultur/oslo/places_subkultur/brenneriveien_ingens_gate.json
- data/places/subkultur/oslo/places_subkultur/gamlebyen_sport_og_fritid.json
- data/places/subkultur/oslo/places_subkultur/oslo_skatehall.json
- data/places/subkultur/oslo/places_subkultur/xray_ungdomskulturhus.json
- data/places/subkultur/oslo/places_subkultur/vaterland_bar_scene.json
- data/places/subkultur/oslo/places_subkultur/helvete_neseblod_records.json
- data/places/subkultur/oslo/places_subkultur/last_train_oslo.json
- data/places/subkultur/oslo/places_subkultur/rock_in_oslo.json
- data/places/subkultur/oslo/places_subkultur/club_7_vika.json
- data/places/subkultur/oslo/places_subkultur/revolver_oslo.json
- data/places/subkultur/oslo/places_subkultur/the_villa.json
- data/places/subkultur/oslo/places_subkultur/jaeger_oslo.json
- data/places/subkultur/oslo/places_subkultur/sub_scene.json
- data/places/subkultur/oslo/places_subkultur/mir_grunerlokka_lufthavn.json
- data/places/subkultur/oslo/places_subkultur/plata_oslo.json
- data/places/subkultur/oslo/places_subkultur/prindsen_mottakssenter.json
- data/places/subkultur/oslo/places_subkultur/fyrlyset_oslo.json
- data/places/subkultur/oslo/places_subkultur/evangeliesenteret_kontaktsenter_oslo.json
- data/places/subkultur/oslo/places_subkultur/brugata_storgata_rusmiljo.json
- data/places/subkultur/oslo/places_subkultur/huset_oslo.json
- data/places/subkultur/oslo/places_subkultur/nadheim_oslo.json
- data/places/subkultur/oslo/places_subkultur/motestedet_tollbugata.json
- data/places/vitenskap/oslo/places_vitenskap/universitetets_gamle_hovedbygning.json
- data/places/vitenskap/oslo/places_vitenskap/universitetets_gamle_kjemi.json
- data/places/vitenskap/oslo/places_vitenskap/tvergastein.json
- data/places/vitenskap/oslo/places_vitenskap/gamlebyen_skole.json
- data/places/vitenskap/oslo/places_vitenskap/abelhaugen.json
- data/places/vitenskap/oslo/places_vitenskap/universitetet_i_oslo_blindern.json
- data/places/vitenskap/oslo/places_vitenskap/naturhistorisk_museum.json
- data/places/vitenskap/oslo/places_vitenskap/botanisk_hage.json
- data/places/vitenskap/oslo/places_vitenskap/teknisk_museum.json
- data/places/vitenskap/oslo/places_vitenskap/forskningsparken.json
- data/places/vitenskap/oslo/places_vitenskap/rikshospitalet.json
- data/places/vitenskap/oslo/places_vitenskap/radiumhospitalet.json
- data/places/vitenskap/oslo/places_vitenskap/meteorologisk_institutt.json
- data/places/vitenskap/oslo/places_vitenskap/oslo_met_pilestredet.json
- data/places/vitenskap/oslo/places_vitenskap/arkitektur_og_designhogskolen.json
- data/places/vitenskap/oslo/places_vitenskap/bi_nydalen.json
- data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner/nobelinstituttet.json
- data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner/observatoriet.json
- data/places/psykologi/oslo/places_psykologi/psykologisk_institutt_uio.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_city.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_praca_do_comercio.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_alfama.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_elevador_de_santa_justa.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_ponte_25_de_abril.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_rossio.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_avenida_da_liberdade.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_parque_eduardo_vii.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_cais_do_sodre.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_principe_real.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_baixa_pombalina.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_bica.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_graca.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_belem_bydel.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_alcantara.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_intendente.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_chiado.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_campo_de_ourique.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_estrela.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_lapa.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_ajuda.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_campo_pequeno.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_entrecampos.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_oriente_station.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_martim_moniz_mouraria_axis.json
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_gare_do_cais_do_sodre.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_torre_de_belem.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_mosteiro_dos_jeronimos.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_castelo_de_sao_jorge.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_se_de_lisboa.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_convento_do_carmo.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_padrao_dos_descobrimentos.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_teatro_romano.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_panteao_nacional.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_sao_vicente_de_fora.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_palacio_fronteira.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_museu_de_lisboa.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_igreja_de_santo_antonio.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_igreja_de_sao_roque.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_museu_do_aljube.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_igreja_de_sao_domingos.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_museu_de_marinha.json
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_museu_nacional_dos_coches.json
- data/places/by/europe/portugal/lisbon/lisbon_aqueduto_das_aguas_livres/lisbon_aqueduto_das_aguas_livres.json
- data/places/by/europe/portugal/lisbon/lisbon_estacao_do_rossio/lisbon_estacao_do_rossio.json
- data/places/politikk/europe/portugal/lisbon/lisbon_palacio_ajuda/lisbon_palacio_ajuda.json
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_assembleia_da_republica.json
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_largo_do_carmo.json
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_praca_dos_restauradores.json
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_praca_marques_de_pombal.json
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_praca_do_municipio.json
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_tribunal_constitucional.json
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_fundacao_mario_soares_maria_barroso.json
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_avenida_24_de_julho.json
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_palacio_de_belem.json
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_museu_nacional_do_azulejo.json
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_fundacao_calouste_gulbenkian.json
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_maat.json
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_museu_nacional_de_arte_antiga.json
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_centro_cultural_de_belem.json
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_museu_do_oriente.json
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_mac_ccb_berardo.json
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_museu_nacional_de_arte_contemporanea_do_chiado.json
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_mude.json
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_culturgest.json
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_museu_arpad_szenes_vieira_da_silva.json
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_museu_bordalo_pinheiro.json
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur/lisbon_casa_dos_bicos.json
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur/lisbon_a_brasileira.json
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur/lisbon_livraria_bertrand.json
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur/lisbon_casa_fernando_pessoa.json
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur/lisbon_biblioteca_nacional_de_portugal.json
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur/lisbon_cemiterio_dos_prazeres.json
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur/lisbon_praca_luis_de_camoes.json
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur/lisbon_estatua_eca_de_queiros.json
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur/lisbon_hemeroteca_municipal.json
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur/lisbon_gremio_literario.json
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur/lisbon_casa_dos_estudantes_do_imperio.json
- data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk/lisbon_mouraria_fado.json
- data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk/lisbon_hot_clube_de_portugal.json
- data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk/lisbon_museu_do_fado.json
- data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk/lisbon_coliseu_dos_recreios.json
- data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk/lisbon_clube_de_fado.json
- data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk/lisbon_tasca_do_chico.json
- data/places/scenekunst/europe/portugal/lisbon/places_lisbon_scenekunst/lisbon_teatro_nacional_d_maria_ii.json
- data/places/scenekunst/europe/portugal/lisbon/places_lisbon_scenekunst/lisbon_teatro_sao_luiz.json
- data/places/scenekunst/europe/portugal/lisbon/places_lisbon_scenekunst/lisbon_teatro_tivoli_bbva.json
- data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_bairro_alto.json
- data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_pink_street.json
- data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_galeria_ze_dos_bois.json
- data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_musicbox.json
- data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_fabrica_braco_de_prata.json
- data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_crew_hassan.json
- data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_village_underground.json
- data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_desterro.json
- data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_anjos70.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_lx_factory.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_mercado_da_ribeira.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_parque_das_nacoes.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_cordoaria_nacional.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_doca_de_alcantara.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_mercado_de_campo_de_ourique.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_armazens_do_chiado.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_terminal_de_cruzeiros.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_altice_arena_web_summit.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_startup_lisboa_rua_da_prata.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_hub_criativo_do_beato.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_banco_de_portugal_museu_do_dinheiro.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_edp_headquarters.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_santander_portugal_headquarters.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_jncquoi_avenida_da_liberdade.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_jeronimo_martins_headquarters.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_a_vida_portuguesa_chiado.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_conserveira_de_lisboa.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_aeroporto_humberto_delgado_tap_headquarters.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_santa_apolonia_station.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_pestana_palace_hotel.json
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_bairro_alto_hotel_praca_luis_de_camoes.json
- data/places/sport/europa/portugal/footballgrounds_lisbon/lisbon_estadio_da_luz.json
- data/places/sport/europa/portugal/footballgrounds_lisbon/lisbon_estadio_jose_alvalade.json
- data/places/sport/europa/portugal/footballgrounds_lisbon/lisbon_estadio_nacional_jamor.json
- data/places/sport/europa/portugal/footballgrounds_lisbon/lisbon_complexo_desportivo_do_restelo.json
- data/places/sport/europa/portugal/footballgrounds_lisbon/lisbon_estadio_da_tapadinha.json
- data/places/sport/europa/portugal/footballgrounds_lisbon/lisbon_estadio_jose_gomes_amadora.json
- data/places/sport/europa/portugal/sportvenues_lisbon/lisbon_estadio_universitario.json
- data/places/sport/europa/portugal/sportvenues_lisbon/lisbon_pavilhao_joao_rocha.json
- data/places/sport/europa/portugal/sportvenues_lisbon/lisbon_hipodromo_do_campo_grande.json
- data/places/sport/europa/portugal/sportvenues_lisbon/lisbon_centro_nautico_de_belem.json
- data/places/sport/europa/portugal/sportvenues_lisbon/lisbon_pista_moniz_pereira.json
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_jardim_botanico.json
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_tapada_das_necessidades.json
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_miradouro_sao_pedro_de_alcantara.json
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_miradouro_da_graca.json
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_monsanto.json
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_jardim_da_estrela.json
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_jardim_do_torel.json
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_miradouro_da_senhora_do_monte.json
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_tapada_da_ajuda.json
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_jardim_gulbenkian.json
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_jardim_do_principe_real.json
- data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_cinemateca_portuguesa.json
- data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_cinema_sao_jorge.json
- data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_cinema_ideal.json
- data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_cinema_nimas.json
- data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_tobis_portuguesa.json
- data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_doclisboa.json
- data/places/media/europe/portugal/lisbon/places_lisbon_media/lisbon_rtp.json
- data/places/media/europe/portugal/lisbon/places_lisbon_media/lisbon_diario_de_noticias.json
- data/places/media/europe/portugal/lisbon/places_lisbon_media/lisbon_lusa.json
- data/places/media/europe/portugal/lisbon/places_lisbon_media/lisbon_antena_1_rdp.json
- data/places/media/europe/portugal/lisbon/places_lisbon_media/lisbon_arquivo_rtp.json
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_museu_nacional_de_historia_natural_e_da_ciencia.json
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_observatorio_astronomico.json
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_instituto_superior_tecnico.json
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_faculdade_de_ciencias.json
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_pavilhao_do_conhecimento.json
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_jardim_botanico_tropical.json
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_instituto_higiene_medicina_tropical.json
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_laboratorio_nacional_engenharia_civil.json
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_instituto_ricardo_jorge.json
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_torre_do_tombo.json
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_champalimaud_foundation.json
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
- data/places/naeringsliv/vestland/etne/norsk_motormuseum_skanevik/norsk_motormuseum_skanevik.json
- data/places/naeringsliv/vestland/etne/sunnhordland_mek_verkstad_leknestangen/sunnhordland_mek_verkstad_leknestangen.json
- data/places/naeringsliv/vestland/etne/skanevik_hermetikkfabrikk/skanevik_hermetikkfabrikk.json
- data/places/naeringsliv/vestland/etne/litledalen_kraftverk/litledalen_kraftverk.json
- data/places/naeringsliv/vestland/etne/hardeland_kraftverk/hardeland_kraftverk.json
- data/places/by/vestland/etne/etnesjoen_tettstad/etnesjoen_tettstad.json
- data/places/by/vestland/etne/etnesjoen_torg_og_kai/etnesjoen_torg_og_kai.json
- data/places/by/vestland/etne/skanevik_sentrum/skanevik_sentrum.json
- data/places/by/vestland/etne/skanevik_ferjekai/skanevik_ferjekai.json
- data/places/by/vestland/etne/kyrping_handelsstad/kyrping_handelsstad.json
- data/places/kunst/vestland/etne/skakke_kultursenter_etne/skakke_kultursenter_etne.json
- data/places/kunst/vestland/etne/skanevik_kultur_og_idrettshall/skanevik_kultur_og_idrettshall.json
- data/places/kunst/vestland/etne/house_of_blues_skanevik/house_of_blues_skanevik.json
- data/places/kunst/vestland/etne/skanevik_fjordhotel_pippifestivalen/skanevik_fjordhotel_pippifestivalen.json
- data/places/kunst/vestland/etne/musikkpaviljongen_doktorhagen/musikkpaviljongen_doktorhagen.json
- data/places/kunst/vestland/etne/old_river_saloon_etne/old_river_saloon_etne.json
- data/places/kunst/vestland/etne/abc_studio_etne/abc_studio_etne.json
- data/places/kunst/vestland/etne/fugl_fonix_etne/fugl_fonix_etne.json
- data/places/litteratur/vestland/etne/olav_vik_garden_osnes/olav_vik_garden_osnes.json
- data/places/litteratur/vestland/etne/ingvar_moe_byste_etne/ingvar_moe_byste_etne.json
- data/places/litteratur/vestland/etne/gurine_johan_ebnes_minde/gurine_johan_ebnes_minde.json
- data/places/sport/vestland/etne/etne_idrettsanlegg/etne_idrettsanlegg.json
- data/places/sport/vestland/etne/steinsvollen_fotballanlegg/steinsvollen_fotballanlegg.json
- data/places/sport/vestland/etne/engebanen_etne/engebanen_etne.json
- data/places/sport/vestland/etne/skanevik_idrettsanlegg/skanevik_idrettsanlegg.json
- data/places/sport/vestland/etne/etne_bmx_og_skatepark/etne_bmx_og_skatepark.json
- data/places/sport/vestland/etne/etne_tennisanlegg/etne_tennisanlegg.json
- data/places/sport/vestland/etne/skanevik_skatepark/skanevik_skatepark.json
- data/places/sport/vestland/etne/sjokanten_trivsel_skanevik/sjokanten_trivsel_skanevik.json
- data/places/sport/vestland/etne/etne_kyokushin_dojo/etne_kyokushin_dojo.json
- data/places/sport/vestland/etne/fikse_skytebane/fikse_skytebane.json
- data/places/historie/oslo/places_historie/abelonegarden.json
- data/places/sport/vestland/etne/etne_pumptrack/etne_pumptrack.json
- data/places/sport/vestland/etne/skakkeringen_etne/skakkeringen_etne.json
- data/places/sport/vestland/etne/osnes_discgolfbane/osnes_discgolfbane.json
- data/places/sport/vestland/etne/skanevik_discgolf/skanevik_discgolf.json
- data/places/politikk/vestland/etne/etne_tinghus.json
- data/places/politikk/vestland/etne/etne_brannstasjon.json
- data/places/politikk/vestland/etne/skanevik_brannstasjon.json
- data/places/natur/vestland/langfoss_etne/langfoss_etne.json
- data/places/natur/vestland/akrafjorden/akrafjorden.json
- data/places/natur/vestland/jettegrytene_rullestad/jettegrytene_rullestad.json
- data/places/natur/vestland/etneelva/etneelva.json
- data/places/natur/vestland/stordalsvatnet_etne/stordalsvatnet_etne.json
- data/places/sport/vestland/etne/skanevik_skytebane/skanevik_skytebane.json
- data/places/natur/rogaland/vikedalselva/vikedalselva.json
- data/places/natur/rogaland/vindafjorden/vindafjorden.json
- data/places/natur/rogaland/svandalsfossen/svandalsfossen.json
- data/places/natur/rogaland/suldalslagen/suldalslagen.json
- data/places/natur/rogaland/suldalsvatnet/suldalsvatnet.json
- data/places/vitenskap/vestland/etne/etneelva_forskningsplattform/etneelva_forskningsplattform.json
- data/places/media/vestland/etne/grannar_redaksjon_etne/grannar_redaksjon_etne.json
- data/places/psykologi/vestland/etne/psykisk_helse_rus_etne/psykisk_helse_rus_etne.json
- data/places/psykologi/vestland/etne/psykisk_helse_rus_skanevik/psykisk_helse_rus_skanevik.json
- data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05/frammuseet.json
- data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05/kon_tiki_museet.json
- data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05/gol_stavkirke_bygdoy.json
- data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06/nordisk_bibelmuseum.json
- data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06/norges_hjemmefrontmuseum.json
- data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06/forsvarsmuseet.json
- data/places/naeringsliv/oslo/places_naeringsliv_atlas_obscura_flop_batch_07/flop_museum.json
- data/places/vitenskap/oslo/places_vitenskap_oslo_kultureiendommer_batch_01/folkeobservatoriet_holmenkollen.json
- data/places/sport/europa/norway/places_oslo_kultureiendommer_batch_01/kjeglebanen_langgaardslokken.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_02/radmannsgarden_og_anatomibygget.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_02/magistratgarden.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03/hauges_minde.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03/slurpen_lakkegata.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04/geitmyra_gard.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04/gronland_politistasjon.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04/toyen_trafo.json
- data/places/litteratur/oslo/places_litteratur_oslo_kultureiendommer_batch_05/honse_lovisas_hus.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_05/sagene_festivitetshus.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_05/etterstadgata_6.json
- data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_05/villa_furulund.json
- data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_06/villa_romsli.json
- data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_06/roseslottet.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_07/stubljan_paviljongen_hvervenbukta.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_08/trosterudvillaen.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/sporveismuseet.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/saxegarden.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/ovre_fossum_gard.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/lambertseter_gard.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/nordre_skoyen_hovedgard.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/lokomotivverkstedet.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/tveten_gard.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_11/minneparken_gamlebyen.json
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_13/bankall_gard.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_13/frysja_33_brekke_kraftstasjon.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/steen_og_strom.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/centralbanken_kirkegata.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/kafe_grei.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/borsen_oslo.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/treschowgarden.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01/kirkeristen_basarene_brannvakten.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01/den_gamle_krigsskolen.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02/hotel_du_nord.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02/cafe_engebret.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/garmanngarden.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/stattholdergarden.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/waisenhuset_kongens_gate.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/myntgatakvartalet.json
- data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03/wessels_plass.json
- data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03/egertorget.json
- data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03/stortorget.json
- data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03/grev_wedels_plass.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03/amerikalinjen.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03/dfds_bygget.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_04/kontraskjaeret.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_04/palehaven_paleet.json
- data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_04/ostbanestasjonen.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04/tollboden_oslo.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04/tollpakkhuset.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04/norges_bank_bankplassen_4.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_art_sites_batch_01/mustadgarden_kongens_gate_3.json
- data/places/kunst/oslo/places_kunst_oslo_oppdag_kvadraturen_art_sites_batch_01/skulptursonen_ovre_slottsgate.json
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_hovedstaden_batch_01/avisen_tiden_radhusgata_10.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_hovedstaden_batch_01/sjofartsbygningen.json
- data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_hovedstaden_batch_02/schiollgarden_prinsens_gate_26.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_under_bakken_batch_01/norges_bank_bankplassen_2.json
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_stil_arkitektur_batch_01/kirkegata_5.json
- data/places/litteratur/oslo/places_litteratur_oslo_bla_skilt_2026_batch_01/bla_skilt_stein_mehren_ullevalsveien_60.json
- data/places/politikk/oslo/places_politikk_oslo_bla_skilt_2026_batch_01/bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5.json
- data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01/bla_skilt_helverschous_lokke_munkedamsveien_35.json
- data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01/bla_skilt_enerhaugen_samfund_smedgata_34.json
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
- data/places/natur/vestland/langebudalen_naturreservat/langebudalen_naturreservat.json
- data/places/natur/vestland/saevareidberget_landskapsvernomrade/saevareidberget_landskapsvernomrade.json
- data/places/natur/vestland/brattholmen_naturreservat_etne/brattholmen_naturreservat_etne.json
- data/places/natur/vestland/skano_naturreservat_etne/skano_naturreservat_etne.json
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
- data/places/scenekunst/vestland/den_nationale_scene/den_nationale_scene.json
- data/places/scenekunst/rogaland/rogaland_teater/rogaland_teater.json
- data/places/scenekunst/trondelag/trondelag_teater/trondelag_teater.json
- data/places/scenekunst/troms/halogaland_teater/halogaland_teater.json
- data/places/scenekunst/telemark/teater_ibsen/teater_ibsen.json
- data/places/scenekunst/nordland/nordland_teater/nordland_teater.json
- data/places/scenekunst/more_og_romsdal/teatret_vart_plassen/teatret_vart_plassen.json
- data/places/scenekunst/vestland/teater_vestland_nynorskhuset/teater_vestland_nynorskhuset.json
- data/places/scenekunst/vestland/det_vestnorske_teateret/det_vestnorske_teateret.json
- data/places/scenekunst/finnmark/beaivvas_coarvematta/beaivvas_coarvematta.json
- data/places/subkultur/trondelag/uffa_huset_trondheim/uffa_huset_trondheim.json
- data/places/subkultur/trondelag/ressurssenter_kvinner_trondheim/ressurssenter_kvinner_trondheim.json
- data/places/subkultur/vestland/nygardsparken_bergen/nygardsparken_bergen.json
- data/places/subkultur/trondelag/svartlamon_trondheim/svartlamon_trondheim.json
- data/places/subkultur/vestland/hulen_bergen/hulen_bergen.json
- data/places/subkultur/vestland/bergen_kjott_kulturhus/bergen_kjott_kulturhus.json
- data/places/subkultur/rogaland/tou_stavanger/tou_stavanger.json
- data/places/sport/oslo/voldslokka_pumptrack/voldslokka_pumptrack.json
- data/places/subkultur/trondelag/trikkestallen_skatepark_trondheim/trikkestallen_skatepark_trondheim.json
- data/places/sport/vestland/fysak_slettebakken/fysak_slettebakken.json
- data/places/subkultur/akershus/arena_bekkestua/arena_bekkestua.json
- data/places/subkultur/vestland/mo_senteret_gyldenpris/mo_senteret_gyldenpris.json
- data/places/subkultur/rogaland/matfellesskap_st_petri_stavanger/matfellesskap_st_petri_stavanger.json
- data/places/subkultur/troms/kafe_x_tromso/kafe_x_tromso.json
- data/places/religion/vestland/etne/etne_kyrkje/etne_kyrkje.json
- data/places/religion/vestland/etne/skanevik_kyrkje/skanevik_kyrkje.json
- data/places/religion/vestland/etne/frette_kapell/frette_kapell.json
- data/places/scenekunst/buskerud/brageteatret_union_scene/brageteatret_union_scene.json
- data/places/scenekunst/rogaland/haugesund_teater_haut_scene/haugesund_teater_haut_scene.json
- data/places/scenekunst/ostfold/ostfold_teater/ostfold_teater.json
- data/places/scenekunst/trondelag/turneteatret_i_trondelag/turneteatret_i_trondelag.json
- data/places/scenekunst/innlandet/teater_innlandet_hamar_kulturhus/teater_innlandet_hamar_kulturhus.json
- data/places/scenekunst/agder/bruddet_fjaereheia/bruddet_fjaereheia.json
- data/places/scenekunst/agder/teateret_kristiansand/teateret_kristiansand.json
- data/places/scenekunst/trondelag/rosendal_teater/rosendal_teater.json
- data/places/scenekunst/vestland/cornerteateret/cornerteateret.json
- data/places/scenekunst/vestland/studio_bergen_carte_blanche/studio_bergen_carte_blanche.json
- data/places/scenekunst/akershus/baerum_kulturhus/baerum_kulturhus.json
- data/places/scenekunst/buskerud/drammens_teater/drammens_teater.json
- data/places/scenekunst/oslo/dramatikkens_hus/dramatikkens_hus.json
- data/places/scenekunst/oslo/teater_manu/teater_manu.json
- data/places/scenekunst/oslo/vega_scene/vega_scene.json
- data/places/scenekunst/akershus/lille_scene_sandvika/lille_scene_sandvika.json
- data/places/scenekunst/akershus/sandvika_teater/sandvika_teater.json
- data/places/scenekunst/more_og_romsdal/fabrikken_kulturscene/fabrikken_kulturscene.json
- data/places/scenekunst/rogaland/rimi_imir_scenekunst/rimi_imir_scenekunst.json
- data/places/scenekunst/vestfold/papirhuset_teater/papirhuset_teater.json
- data/places/natur/vestland/etne/folgefonnanasjonalpark_etne/folgefonnanasjonalpark_etne.json
- data/places/natur/vestland/etne/mosneselva_etne/mosneselva_etne.json
- data/places/natur/vestland/etne/etnefjella/etnefjella.json
- data/places/natur/vestland/etne/skaneviksfjella/skaneviksfjella.json
- data/places/natur/vestland/etne/bokeskogen_milja/bokeskogen_milja.json
- data/places/natur/vestland/etne/vannes_geologiske_omrade/vannes_geologiske_omrade.json
- data/places/natur/vestland/etne/flateskar_stordalen/flateskar_stordalen.json
- data/places/natur/vestland/etne/terrasselandskapet_etne/terrasselandskapet_etne.json
- data/places/natur/vestland/etne/rullestadvatnet/rullestadvatnet.json
- data/places/natur/vestland/etne/vaulaelva_vassdraget/vaulaelva_vassdraget.json
- data/places/natur/vestland/etne/saltana_etne/saltana_etne.json
- data/places/natur/vestland/etne/krokavatnet_etneforkastningen/krokavatnet_etneforkastningen.json
- data/places/natur/vestland/etne/moreneryggen_skanevik/moreneryggen_skanevik.json
- data/places/natur/vestland/etne/sandvikevatnet_etne/sandvikevatnet_etne.json
- data/places/natur/vestland/etne/taraldsoy/taraldsoy.json
- data/places/natur/vestland/etne/osnes_honsvikjo/osnes_honsvikjo.json
- data/places/natur/vestland/etne/vikedalsvassdraget_bjonndalen/vikedalsvassdraget_bjonndalen.json
- data/places/scenekunst/telemark/grenland_friteater/grenland_friteater.json
- data/places/scenekunst/finnmark/samovarteateret_sor_varanger_kultursal/samovarteateret_sor_varanger_kultursal.json
- data/places/scenekunst/troms/radstua_teaterhus/radstua_teaterhus.json
- data/places/scenekunst/innlandet/hamar_teater/hamar_teater.json
- data/places/scenekunst/innlandet/radhus_teatret_kongsvinger/radhus_teatret_kongsvinger.json
- data/places/kunst/oslo/places_kunst/fotogalleriet.json
- data/places/kunst/oslo/places_kunst/kunstnerforbundet.json
- data/places/natur/oslo/lillomarka.json
- data/places/natur/oslo/brekkedammen.json
- data/places/by/oslo/grorudparken.json
- data/places/historie/oslo/places_historie/aamot_bru.json
- data/places/kunst/oslo/places_kunst/klosterenga_skulpturpark.json
- data/places/kunst/oslo/places_kunst/peer_gynt_parken.json
- data/places/kunst/oslo/places_kunst/edvard_munchs_atelier_ekely.json
- data/places/kunst/oslo/places_kunst/tegnerforbundet.json
- data/places/kunst/oslo/places_kunst/unge_kunstneres_samfund.json
- data/places/kunst/oslo/places_kunst/norske_grafikere.json
- data/places/historie/oslo/places_historie/the_mini_bottle_gallery.json
- data/places/kunst/oslo/places_kunst/galleri_lnm.json
- data/places/kunst/oslo/places_kunst/ram_galleri.json
- data/places/kunst/oslo/places_kunst/galleri_schaeffers_gate_5.json
- data/places/kunst/oslo/places_kunst/grafill.json
- data/places/naeringsliv/akershus/akershus_energipark.json
- data/places/naeringsliv/akershus/telenor_fornebu.json
- data/places/natur/akershus/tjernsmyr_salamanderlokalitet.json
- data/places/by/europe/portugal/lisbon/lisbon_tram_28.json
- data/places/film_tv/oslo/cinemateket_oslo.json
- data/places/film_tv/oslo/colosseum_kino.json
- data/places/litteratur/europe/portugal/lisbon/lisbon_feira_do_livro.json
- data/places/media/oslo/frognerstranda.json
- data/places/media/oslo/grand_hotel.json
- data/places/musikk/europe/portugal/lisbon/lisbon_casa_museu_amalia_rodrigues.json
- data/places/naeringsliv/europe/portugal/lisbon/lisbon_feira_da_ladra.json
- data/places/politikk/oslo/slottsplassen.json
- data/places/religion/europe/portugal/lisbon/lisbon_santo_antonio_festival.json
- data/places/scenekunst/europe/portugal/lisbon/lisbon_marchas_populares.json
- data/places/scenekunst/oslo/chateau_neuf.json
- data/places/subkultur/oslo/house_of_nerds.json
- data/places/scenekunst/oslo/bla_skilt_aud_schonemann_vetlandsveien_69d.json
- data/places/vitenskap/oslo/places_vitenskap/bitraf.json
- data/places/vitenskap/oslo/places_vitenskap/radionette_fodested_bygdoy_alle_67.json
- data/places/vitenskap/oslo/places_vitenskap/sintef_minalab.json
- data/places/vitenskap/oslo/places_vitenskap/stk_pex_kabeltarnet.json
- data/places/vitenskap/oslo/places_vitenskap/tandbergs_radiofabrikk_kjelsas.json
- data/places/by/oslo/places/frogner.json
- data/places/by/oslo/places/holmlia.json
- data/places/by/vestland/bergen/bergen.json
- data/places/by/agder/valle_setesdal/valle_setesdal.json
- data/places/by/nordland/narvik/narvik.json
- data/places/by/buskerud/aal/aal.json
- data/places/by/agder/kristiansand/kristiansand.json
- data/places/by/rogaland/stavanger/stavanger.json
- data/places/by/vestland/voss/voss.json
- data/places/by/nordland/bodo/bodo.json
- data/places/by/troms/tromso/tromso.json
- data/places/by/finnmark/hammerfest/hammerfest.json
- data/places/by/finnmark/tana/tana.json
- data/places/by/nordland/hattfjelldal/hattfjelldal.json
- data/places/by/nordland/soemna/soemna.json
- data/places/psykologi/oslo/places_psykologi/nkvts_nydalen.json
- data/places/psykologi/oslo/places_psykologi/nic_waals_institutt.json
- data/places/natur/oslo/miljo_gjenbruk/grefsen_gjenvinningsstasjon.json
- data/places/natur/oslo/miljo_gjenbruk/haraldrud_gjenvinningsstasjon.json
- data/places/natur/oslo/miljo_gjenbruk/ryen_gjenvinningsstasjon.json
- data/places/natur/oslo/miljo_gjenbruk/smestad_gjenvinningsstasjon.json
- data/places/natur/oslo/miljo_gjenbruk/lindeberg_gjenvinningsstasjon.json
- data/places/natur/oslo/miljo_gjenbruk/kampen_gjenvinningsstasjon.json
- data/places/natur/oslo/miljo_gjenbruk/romsas_gjenvinningsstasjon.json
- data/places/natur/oslo/miljo_gjenbruk/sofienbergparken_gjenvinningsstasjon.json
- data/places/natur/oslo/miljo_gjenbruk/trosterud_gjenvinningsstasjon.json
- data/places/natur/oslo/miljo_gjenbruk/haraldrud_ombrukstelt.json
- data/places/natur/oslo/miljo_gjenbruk/gronmo_ombrukstelt.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_11_kjelsasveien_141.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_22_vigelandsparken.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_79_inkognitogata.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_42_munkedamsveien.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_10_refstadsvingen.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_76_hjemmets_kolonihager.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_13_jacob_aalls_gate_58.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_74_huk_aveny_35.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_56_vestgrensa_2.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_51_skedsmogata_20.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_9_akershusstranda_3.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_70_sagene_kirke.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_71_sagene_kirke.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_0_sentralen.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_23_skoyen_stasjon.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_1_solli_plass.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_50_bislett_stadion.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_78_olav_kyrres_plass.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_80_majorstukrysset.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_8_radhusgata_28.json
- data/places/litteratur/oslo/lesekiosk/lesekiosk_48_valerenga_kirke.json
- data/places/natur/oslo/miljo_gjenbruk/gronmo_gjenvinningsstasjon.json
- data/places/natur/oslo/miljo_gjenbruk/sorenga_gjenvinningsstasjon.json
- data/places/natur/oslo/miljo_gjenbruk/bygdoy_miljostasjon.json
- data/places/natur/oslo/miljo_gjenbruk/frysja_miljostasjon.json
- data/places/natur/oslo/miljo_gjenbruk/kringsja_miljostasjon.json
- data/places/natur/oslo/miljo_gjenbruk/lambertseter_miljostasjon.json
- data/places/natur/oslo/miljo_gjenbruk/lindebergasen_miljostasjon.json
- data/places/natur/oslo/miljo_gjenbruk/lindoya_miljostasjon.json
- data/places/natur/oslo/miljo_gjenbruk/mosseveien_miljostasjon.json
- data/places/natur/oslo/miljo_gjenbruk/munkerud_miljostasjon.json
- data/places/natur/oslo/miljo_gjenbruk/oppsal_miljostasjon.json
- data/places/natur/oslo/miljo_gjenbruk/skjonhaug_miljostasjon.json
- data/places/natur/oslo/miljo_gjenbruk/sogn_miljostasjon.json
- data/places/natur/oslo/miljo_gjenbruk/tveita_miljostasjon.json
- data/places/natur/oslo/miljo_gjenbruk/ulven_miljostasjon.json
- data/places/by/oslo/bla_skilt/bla_skilt_gartnerlokka_urtegata_50.json
- data/places/helse/oslo/bla_skilt/bla_skilt_cathinka_guldberg_lovisenberggata_15a.json
- data/places/helse/oslo/bla_skilt/bla_skilt_sulpen_keysers_gate_5.json
- data/places/vitenskap/oslo/bla_skilt/bla_skilt_vebjorn_tandberg_kongens_gate_15.json
- data/places/historie/oslo/snublestein/snublestein_rebekka_blatt_nordre_gate_13.json
- data/places/historie/oslo/snublestein/snublestein_fanny_steinsapir_bjerregaards_gate_68.json
- data/places/historie/oslo/snublestein/snublestein_benno_damelin_schonings_gate_14.json
- data/places/historie/oslo/snublestein/snublestein_salomon_bogomolno_d_y_jens_bjelkes_gate_64.json
- data/places/historie/oslo/snublestein/snublestein_harry_isidor_mendel_ullevalsveien_97.json
- data/places/historie/oslo/snublestein/snublestein_isak_kaplan_kirkegardsgata_2.json
- data/places/natur/oslo/miljo_gjenbruk/hoybraten_miljostasjon.json
- data/places/sport/oslo/bla_skilt/bla_skilt_kjeglebanen_briskebyveien_21.json
- data/places/politikk/oslo/bla_skilt/bla_skilt_fredrikke_qvam_pilestredet_81.json
- data/places/politikk/oslo/bla_skilt/bla_skilt_sophie_borchgrevink_cort_adelers_gate_33.json
- data/places/naeringsliv/oslo/bla_skilt/bla_skilt_universal_presentkort_lille_grensen_7.json
- data/places/kunst/oslo/bla_skilt/bla_skilt_inger_sitter_president_harbitz_gate_19b.json
- data/places/kunst/oslo/bla_skilt/bla_skilt_per_ung_jarlsborgveien_12a.json
- data/places/musikk/oslo/bla_skilt/bla_skilt_robert_levin_gabels_gate_46b.json
- data/places/utdanning/oslo/bla_skilt/bla_skilt_helga_eng_waldemar_thranes_gate_42.json
- data/places/vitenskap/oslo/bla_skilt/bla_skilt_thekla_resvoll_bestum_tverrvei_1.json
- data/places/litteratur/oslo/bla_skilt/bla_skilt_anne_cath_vestly_wergelandsveien_7.json
- data/places/politikk/oslo/bla_skilt/bla_skilt_krisesenteret_camilla_waldemar_thranes_gate_70.json
- data/places/vitenskap/oslo/bla_skilt/bla_skilt_eyde_birkeland_bolteloekka_alle_10.json
- data/places/by/oslo/bla_skilt/bla_skilt_holmenkollen_sanatorium_kongeveien_26.json
- data/places/politikk/oslo/bla_skilt/bla_skilt_kim_friele_haakon_tveters_vei_12.json
- data/places/helse/oslo/bla_skilt/bla_skilt_elisabet_helsing_thor_olsens_gate_10.json
- data/places/politikk/oslo/bla_skilt/bla_skilt_marcus_thrane_fredriksborgveien_18.json
- data/places/politikk/oslo/bla_skilt/bla_skilt_anna_rogstad_henrichsens_gate_3.json
- data/places/naeringsliv/oslo/bla_skilt/bla_skilt_astri_stockfleth_sofies_gate_74.json
- data/places/naeringsliv/oslo/places_naeringsliv/freia_fabrikken.json
- data/places/naeringsliv/oslo/places_naeringsliv/alunverket.json
- data/places/historie/oslo/places_historie/akershus_slott.json

## Harde feil
- Ingen

## Varsler
- data/places/by/oslo/places/gronland_basarene.json#gronland_basarene: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places/ring_3.json#ring_3: lineært sted uten anchors
- data/places/by/oslo/places/oslo_s.json#oslo_s: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places/vulkan_energisentral.json#vulkan_energisentral: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places/gronland_kirke.json#gronland_kirke: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places/kampen_kirke.json#kampen_kirke: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places/oslo_bussterminal.json#oslo_bussterminal: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places/christiania_torv.json#christiania_torv: lineært sted uten anchors
- data/places/by/oslo/places/deichman_bjorvika.json#deichman_bjorvika: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places/voienvolden.json#voienvolden: coordStatus=verified uten coordPrecisionM
- data/places/film/oslo/places/saga_kino.json#saga_kino: coordStatus=verified uten coordPrecisionM
- data/places/film/oslo/places/klingenberg_kino.json#klingenberg_kino: coordStatus=verified uten coordPrecisionM
- data/places/film/oslo/places/gimle_kino.json#gimle_kino: coordStatus=verified uten coordPrecisionM
- data/places/film/oslo/places/vika_kino.json#vika_kino: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/gamle_aker_kirke.json#gamle_aker_kirke: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/villa_grande.json#villa_grande: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/mollergata_19.json#mollergata_19: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/sagene_skole.json#sagene_skole: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/oslo_domkirke/oslo_domkirke.json#oslo_domkirke: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/gamle_trikkestallen/gamle_trikkestallen.json#gamle_trikkestallen: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/slottet/slottet.json#slottet: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/sofienberg_kirke/sofienberg_kirke.json#sofienberg_kirke: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/trefoldighetskirken/trefoldighetskirken.json#trefoldighetskirken: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_added_batch_01/oslo_ladegard.json#oslo_ladegard: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_added_batch_01/botsfengselet.json#botsfengselet: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_added_batch_01/prinds_christian_augusts_minde.json#prinds_christian_augusts_minde: lineært sted uten anchors
- data/places/historie/oslo/places_historie_added_batch_01/peststotten_krist_kirkegard.json#peststotten_krist_kirkegard: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_added_batch_01/villa_stenersen.json#villa_stenersen: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_added_batch_01/st_hallvard_kirke_kloster.json#st_hallvard_kirke_kloster: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/gamle_radhus/gamle_radhus.json#gamle_radhus: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/akershus/eidsvoll_verk_andelva/eidsvoll_verk_andelva.json#eidsvoll_verk_andelva: coordStatus=verified uten coordPrecisionM
- data/places/by/akershus/tertitten_urskog_holandsbanen/tertitten_urskog_holandsbanen.json#tertitten_urskog_holandsbanen: coordStatus=verified uten coordPrecisionM
- data/places/by/akershus/kjeller_flyplass/kjeller_flyplass.json#kjeller_flyplass: coordStatus=verified uten coordPrecisionM
- data/places/historie/akershus/places_historie_akershus_batch2/tanum_kirke.json#tanum_kirke: coordStatus=verified uten coordPrecisionM
- data/places/historie/akershus/places_historie_akershus_batch2/skedsmo_kirke.json#skedsmo_kirke: coordStatus=verified uten coordPrecisionM
- data/places/natur/ostfold/sarpsfossen/sarpsfossen.json#sarpsfossen: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/ostfold/tistedalen_saugbrugsforeningen/tistedalen_saugbrugsforeningen.json#tistedalen_saugbrugsforeningen: lav koordinatpresisjon (<4 desimaler)
- data/places/by/ostfold/brekke_sluser_haldenkanalen/brekke_sluser_haldenkanalen.json#brekke_sluser_haldenkanalen: lav koordinatpresisjon (<4 desimaler)
- data/places/by/ostfold/homlungen_fyr/homlungen_fyr.json#homlungen_fyr: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/buskerud/places_historie_buskerud_batch2/hallingdal_museum_nesbyen.json#hallingdal_museum_nesbyen: stort område uten coordNote/coordStatus
- data/places/naeringsliv/buskerud/eggedal_molle/eggedal_molle.json#eggedal_molle: stort område uten coordNote/coordStatus
- data/places/by/buskerud/drammen_tollbod_havn/drammen_tollbod_havn.json#drammen_tollbod_havn: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch4/laagdalsmuseet.json#laagdalsmuseet: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch4/fiskum_gamle_kirke.json#fiskum_gamle_kirke: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/buskerud/places_historie_buskerud_batch4/hvalsmoen_leir.json#hvalsmoen_leir: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/buskerud/places_historie_buskerud_batch4/dagali_museum.json#dagali_museum: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/buskerud/places_historie_buskerud_batch5/gulskogen_gard.json#gulskogen_gard: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch5/hemsedal_bygdatun.json#hemsedal_bygdatun: stort område uten coordNote/coordStatus
- data/places/historie/buskerud/places_historie_buskerud_batch5/krokkleiva_kongeveien.json#krokkleiva_kongeveien: lineært sted uten anchors
- data/places/kunst/buskerud/hagan_skredsvig/hagan_skredsvig.json#hagan_skredsvig: lineært sted uten anchors
- data/places/historie/buskerud/places_historie_buskerud_batch6/lier_sykehus_historisk_omrade.json#lier_sykehus_historisk_omrade: stort område uten coordNote/coordStatus
- data/places/by/buskerud/vikersund_stasjon_randsfjordbanen/vikersund_stasjon_randsfjordbanen.json#vikersund_stasjon_randsfjordbanen: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch2/norsk_skogmuseum_elverum.json#norsk_skogmuseum_elverum: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch2/glomdalsmuseet_elverum.json#glomdalsmuseet_elverum: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch3/hundorp_dale_gudbrand.json#hundorp_dale_gudbrand: stort område uten coordNote/coordStatus
- data/places/naeringsliv/innlandet/folldal_gruver/folldal_gruver.json#folldal_gruver: stort område uten coordNote/coordStatus
- data/places/naeringsliv/innlandet/raufoss_industripark_ammunisjon/raufoss_industripark_ammunisjon.json#raufoss_industripark_ammunisjon: stort område uten coordNote/coordStatus
- data/places/politikk/innlandet/elverum_folkehogskole_1940/elverum_folkehogskole_1940.json#elverum_folkehogskole_1940: lineært sted uten anchors
- data/places/historie/innlandet/places_historie_innlandet_batch5/oye_stavkirke.json#oye_stavkirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch5/hedalen_stavkirke.json#hedalen_stavkirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch6/finnetunet_skogfinsk_museum.json#finnetunet_skogfinsk_museum: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch6/sor_fron_kirke_gudbrandsdalsdomen.json#sor_fron_kirke_gudbrandsdalsdomen: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch6/odalstunet_sor_odal.json#odalstunet_sor_odal: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch6/eidskog_museum_almenninga.json#eidskog_museum_almenninga: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch7/rendalen_bygdemuseum.json#rendalen_bygdemuseum: stort område uten coordNote/coordStatus
- data/places/litteratur/innlandet/proysenstua_rudshogda/proysenstua_rudshogda.json#proysenstua_rudshogda: stort område uten coordNote/coordStatus
- data/places/litteratur/innlandet/proysenhuset_rudshogda.json#proysenhuset_rudshogda: coordStatus=verified uten coordPrecisionM
- data/places/historie/innlandet/places_historie_innlandet_batch8/gausdal_bygdetun.json#gausdal_bygdetun: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch9/husantunet_alvdal_bygdemuseum.json#husantunet_alvdal_bygdemuseum: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch9/koppangtunet_stor_elvdal.json#koppangtunet_stor_elvdal: lineært sted uten anchors
- data/places/historie/innlandet/places_historie_innlandet_batch9/koppangtunet_stor_elvdal.json#koppangtunet_stor_elvdal: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch9/tylldalen_bygdetun.json#tylldalen_bygdetun: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch10/nord_odal_bygdetun_sand.json#nord_odal_bygdetun_sand: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch11/etnedal_bygdetun_bruflat.json#etnedal_bygdetun_bruflat: stort område uten coordNote/coordStatus
- data/places/naeringsliv/innlandet/mustad_hunnselva_gjovik/mustad_hunnselva_gjovik.json#mustad_hunnselva_gjovik: lineært sted uten anchors
- data/places/naeringsliv/innlandet/mustad_hunnselva_gjovik/mustad_hunnselva_gjovik.json#mustad_hunnselva_gjovik: stort område uten coordNote/coordStatus
- data/places/naeringsliv/innlandet/brumunddal_molle_industri/brumunddal_molle_industri.json#brumunddal_molle_industri: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch12/heidal_kirke.json#heidal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch13/aurdal_kirke.json#aurdal_kirke: stort område uten coordNote/coordStatus
- data/places/naeringsliv/innlandet/espedalen_nikkelverk/espedalen_nikkelverk.json#espedalen_nikkelverk: lineært sted uten anchors
- data/places/naeringsliv/innlandet/espedalen_nikkelverk/espedalen_nikkelverk.json#espedalen_nikkelverk: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch14/sanderud_sykehus_historisk_omrade.json#sanderud_sykehus_historisk_omrade: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch14/romedal_kirke.json#romedal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch14/snertingdal_kirke.json#snertingdal_kirke: stort område uten coordNote/coordStatus
- data/places/by/innlandet/otta_stasjon_gudbrandsdalen/otta_stasjon_gudbrandsdalen.json#otta_stasjon_gudbrandsdalen: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch15/os_kirke_osterdalen.json#os_kirke_osterdalen: stort område uten coordNote/coordStatus
- data/places/by/innlandet/elverum_stasjon_jernbanemiljo/elverum_stasjon_jernbanemiljo.json#elverum_stasjon_jernbanemiljo: lineært sted uten anchors
- data/places/by/innlandet/moelv_stasjon_mjoslinjen/moelv_stasjon_mjoslinjen.json#moelv_stasjon_mjoslinjen: lineært sted uten anchors
- data/places/historie/innlandet/places_historie_innlandet_batch17/grue_finnskog_kirke.json#grue_finnskog_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch17/alvdal_kirke.json#alvdal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/innlandet/places_historie_innlandet_batch18/oyer_kirke.json#oyer_kirke: stort område uten coordNote/coordStatus
- data/places/naeringsliv/innlandet/einunna_kraftverk_folldal/einunna_kraftverk_folldal.json#einunna_kraftverk_folldal: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch1/borrerhaugene_midgard.json#borrerhaugene_midgard: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch1/hvalfangstmuseet_sandefjord.json#hvalfangstmuseet_sandefjord: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch2/molen_brunlanes_gravroysfelt.json#molen_brunlanes_gravroysfelt: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch3/hoyjord_stavkirke.json#hoyjord_stavkirke: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch4/notteroy_kirke_faerder.json#notteroy_kirke_faerder: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch4/kodal_kirke_sandefjord.json#kodal_kirke_sandefjord: stort område uten coordNote/coordStatus
- data/places/by/vestfold/sandefjord_kurbad/sandefjord_kurbad.json#sandefjord_kurbad: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch6/svarstad_kirke_lardal.json#svarstad_kirke_lardal: stort område uten coordNote/coordStatus
- data/places/historie/vestfold/places_historie_vestfold_batch7/bastoy_skolehjem_horten.json#bastoy_skolehjem_horten: lineært sted uten anchors
- data/places/historie/vestfold/places_historie_vestfold_batch7/bastoy_skolehjem_horten.json#bastoy_skolehjem_horten: stort område uten coordNote/coordStatus
- data/places/by/vestfold/sandefjord_stasjon_vestfoldbanen/sandefjord_stasjon_vestfoldbanen.json#sandefjord_stasjon_vestfoldbanen: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch1/heddal_stavkirke.json#heddal_stavkirke: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch1/heddal_stavkirke.json#heddal_stavkirke: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/telemark/places_historie_telemark_batch1/brekkeparken_skien.json#brekkeparken_skien: stort område uten coordNote/coordStatus
- data/places/scenekunst/oslo/places_scenekunst/nationaltheatret.json#nationaltheatret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json#det_norske_teatret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/chat_noir.json#chat_noir: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/edderkoppen_scene.json#edderkoppen_scene: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/latter.json#latter: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/folketeateret.json#folketeateret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/operahuset.json#operahuset: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/black_box_teater.json#black_box_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/dansens_hus_oslo.json#dansens_hus_oslo: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/riksscenen.json#riksscenen: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/oslo_nye_teater_hovedscenen.json#oslo_nye_teater_hovedscenen: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/det_andre_teatret.json#det_andre_teatret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/nordic_black_theatre_cafeteatret.json#nordic_black_theatre_cafeteatret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/centralteatret.json#centralteatret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/grusomhetens_teater.json#grusomhetens_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/rommen_scene.json#rommen_scene: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/salt_oslo.json#salt_oslo: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/places_scenekunst/det_andre_teatret_intimscenen.json#det_andre_teatret_intimscenen: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/telemark/morgedal_norsk_skieventyr/morgedal_norsk_skieventyr.json#morgedal_norsk_skieventyr: stort område uten coordNote/coordStatus
- data/places/naeringsliv/telemark/dalen_hotel_tokke/dalen_hotel_tokke.json#dalen_hotel_tokke: stort område uten coordNote/coordStatus
- data/places/by/telemark/lunde_sluse_telemarkskanalen/lunde_sluse_telemarkskanalen.json#lunde_sluse_telemarkskanalen: lav koordinatpresisjon (<4 desimaler)
- data/places/by/telemark/kjeldal_sluse_telemarkskanalen/kjeldal_sluse_telemarkskanalen.json#kjeldal_sluse_telemarkskanalen: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch5/hjartdal_kirke.json#hjartdal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch5/drangedal_kirke.json#drangedal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch5/nissedal_kyrkje.json#nissedal_kyrkje: stort område uten coordNote/coordStatus
- data/places/naeringsliv/telemark/heroya_industripark_porsgrunn/heroya_industripark_porsgrunn.json#heroya_industripark_porsgrunn: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch6/fyresdal_kyrkje.json#fyresdal_kyrkje: stort område uten coordNote/coordStatus
- data/places/naeringsliv/telemark/klosteroya_union_skien/klosteroya_union_skien.json#klosteroya_union_skien: stort område uten coordNote/coordStatus
- data/places/historie/telemark/places_historie_telemark_batch7/atra_kirke_tinn.json#atra_kirke_tinn: lav koordinatpresisjon (<4 desimaler)
- data/places/by/telemark/bo_stasjon_sorlandsbanen/bo_stasjon_sorlandsbanen.json#bo_stasjon_sorlandsbanen: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/agder/places_historie_agder_batch1/christiansholm_festning_kristiansand.json#christiansholm_festning_kristiansand: lineært sted uten anchors
- data/places/historie/agder/places_historie_agder_batch1/setesdalsmuseet_rysstad.json#setesdalsmuseet_rysstad: stort område uten coordNote/coordStatus
- data/places/by/agder/kristiansand_domkirke_byhistorie/kristiansand_domkirke_byhistorie.json#kristiansand_domkirke_byhistorie: lineært sted uten anchors
- data/places/naeringsliv/agder/knaben_gruver_kvinesdal/knaben_gruver_kvinesdal.json#knaben_gruver_kvinesdal: stort område uten coordNote/coordStatus
- data/places/historie/agder/places_historie_agder_batch2/mollenborg_kanonmuseum_kristiansand.json#mollenborg_kanonmuseum_kristiansand: lineært sted uten anchors
- data/places/historie/agder/places_historie_agder_batch2/mollenborg_kanonmuseum_kristiansand.json#mollenborg_kanonmuseum_kristiansand: lav koordinatpresisjon (<4 desimaler)
- data/places/by/agder/mandal_kirke_byhistorie/mandal_kirke_byhistorie.json#mandal_kirke_byhistorie: stort område uten coordNote/coordStatus
- data/places/by/agder/tyholmen_arendal_byhistorie/tyholmen_arendal_byhistorie.json#tyholmen_arendal_byhistorie: stort område uten coordNote/coordStatus
- data/places/by/agder/flekkefjord_hollenderbyen/flekkefjord_hollenderbyen.json#flekkefjord_hollenderbyen: stort område uten coordNote/coordStatus
- data/places/historie/agder/odderoya_militaerhistorie_kristiansand/odderoya_militaerhistorie_kristiansand.json#odderoya_militaerhistorie_kristiansand: lineært sted uten anchors
- data/places/historie/agder/odderoya_militaerhistorie_kristiansand/odderoya_militaerhistorie_kristiansand.json#odderoya_militaerhistorie_kristiansand: stort område uten coordNote/coordStatus
- data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand/bredalsholmen_dokk_kristiansand.json#bredalsholmen_dokk_kristiansand: lineært sted uten anchors
- data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand/bredalsholmen_dokk_kristiansand.json#bredalsholmen_dokk_kristiansand: stort område uten coordNote/coordStatus
- data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand/bredalsholmen_dokk_kristiansand.json#bredalsholmen_dokk_kristiansand: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/agder/stiftelsen_arkivet_kristiansand/stiftelsen_arkivet_kristiansand.json#stiftelsen_arkivet_kristiansand: lineært sted uten anchors
- data/places/historie/agder/gimle_gard_kristiansand/gimle_gard_kristiansand.json#gimle_gard_kristiansand: lineært sted uten anchors
- data/places/by/agder/setesdalsbanen_grovane/setesdalsbanen_grovane.json#setesdalsbanen_grovane: stort område uten coordNote/coordStatus
- data/places/historie/agder/tromoy_kirke_arendal/tromoy_kirke_arendal.json#tromoy_kirke_arendal: stort område uten coordNote/coordStatus
- data/places/by/agder/posebyen_kristiansand_trehusby/posebyen_kristiansand_trehusby.json#posebyen_kristiansand_trehusby: lineært sted uten anchors
- data/places/historie/agder/oddernes_kirke_kristiansand/oddernes_kirke_kristiansand.json#oddernes_kirke_kristiansand: lineært sted uten anchors
- data/places/by/agder/lillesand_byhistorie_og_havn/lillesand_byhistorie_og_havn.json#lillesand_byhistorie_og_havn: lav koordinatpresisjon (<4 desimaler)
- data/places/by/agder/merdo_uthavn_arendal/merdo_uthavn_arendal.json#merdo_uthavn_arendal: stort område uten coordNote/coordStatus
- data/places/natur/agder/bragdoya_kystkultursenter/bragdoya_kystkultursenter.json#bragdoya_kystkultursenter: stort område uten coordNote/coordStatus
- data/places/by/agder/ryvingen_fyr_mandal/ryvingen_fyr_mandal.json#ryvingen_fyr_mandal: stort område uten coordNote/coordStatus
- data/places/by/agder/ryvingen_fyr_mandal/ryvingen_fyr_mandal.json#ryvingen_fyr_mandal: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/agder/valle_kyrkje_setesdal/valle_kyrkje_setesdal.json#valle_kyrkje_setesdal: stort område uten coordNote/coordStatus
- data/places/historie/agder/spangereid_kirke_lindesnes/spangereid_kirke_lindesnes.json#spangereid_kirke_lindesnes: lav koordinatpresisjon (<4 desimaler)
- data/places/by/agder/flekkefjordbanen_sira/flekkefjordbanen_sira.json#flekkefjordbanen_sira: stort område uten coordNote/coordStatus
- data/places/historie/agder/bakke_kirke_flekkefjord/bakke_kirke_flekkefjord.json#bakke_kirke_flekkefjord: stort område uten coordNote/coordStatus
- data/places/historie/agder/mandal_museum_andorsengarden/mandal_museum_andorsengarden.json#mandal_museum_andorsengarden: stort område uten coordNote/coordStatus
- data/places/historie/agder/ds_hestmanden_kristiansand/ds_hestmanden_kristiansand.json#ds_hestmanden_kristiansand: lineært sted uten anchors
- data/places/naeringsliv/agder/boylefoss_kraftverk_froland/boylefoss_kraftverk_froland.json#boylefoss_kraftverk_froland: stort område uten coordNote/coordStatus
- data/places/historie/agder/lyngdal_kirke/lyngdal_kirke.json#lyngdal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/agder/hidra_kirke_flekkefjord/hidra_kirke_flekkefjord.json#hidra_kirke_flekkefjord: stort område uten coordNote/coordStatus
- data/places/by/agder/arendal_gamle_radhus/arendal_gamle_radhus.json#arendal_gamle_radhus: stort område uten coordNote/coordStatus
- data/places/by/agder/kristiansand_gamle_tollbod/kristiansand_gamle_tollbod.json#kristiansand_gamle_tollbod: lineært sted uten anchors
- data/places/by/agder/oksoy_fyr_kristiansand/oksoy_fyr_kristiansand.json#oksoy_fyr_kristiansand: lineært sted uten anchors
- data/places/by/agder/oksoy_fyr_kristiansand/oksoy_fyr_kristiansand.json#oksoy_fyr_kristiansand: stort område uten coordNote/coordStatus
- data/places/by/agder/gronningen_fyr_kristiansand/gronningen_fyr_kristiansand.json#gronningen_fyr_kristiansand: lineært sted uten anchors
- data/places/historie/agder/kvinesdal_kirke/kvinesdal_kirke.json#kvinesdal_kirke: stort område uten coordNote/coordStatus
- data/places/historie/agder/kvinesdal_kirke/kvinesdal_kirke.json#kvinesdal_kirke: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/agder/feda_kirke_kvinesdal/feda_kirke_kvinesdal.json#feda_kirke_kvinesdal: stort område uten coordNote/coordStatus
- data/places/historie/agder/konsmo_kirke_lyngdal/konsmo_kirke_lyngdal.json#konsmo_kirke_lyngdal: stort område uten coordNote/coordStatus
- data/places/historie/agder/tonstad_kirke_sirdal/tonstad_kirke_sirdal.json#tonstad_kirke_sirdal: stort område uten coordNote/coordStatus
- data/places/historie/agder/flekkefjord_museum/flekkefjord_museum.json#flekkefjord_museum: stort område uten coordNote/coordStatus
- data/places/by/agder/torungen_fyr_arendal/torungen_fyr_arendal.json#torungen_fyr_arendal: stort område uten coordNote/coordStatus
- data/places/by/agder/kristiansand_stasjon/kristiansand_stasjon.json#kristiansand_stasjon: lineært sted uten anchors
- data/places/vitenskap/agder/agder_naturmuseum_kristiansand/agder_naturmuseum_kristiansand.json#agder_naturmuseum_kristiansand: lineært sted uten anchors
- data/places/naeringsliv/agder/bomuldsfabriken_arendal/bomuldsfabriken_arendal.json#bomuldsfabriken_arendal: stort område uten coordNote/coordStatus
- data/places/by/agder/lista_flystasjon_farsund/lista_flystasjon_farsund.json#lista_flystasjon_farsund: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/agder/oyestad_kirke_arendal/oyestad_kirke_arendal.json#oyestad_kirke_arendal: stort område uten coordNote/coordStatus
- data/places/historie/agder/austre_moland_kirke_arendal/austre_moland_kirke_arendal.json#austre_moland_kirke_arendal: stort område uten coordNote/coordStatus
- data/places/by/agder/arendal_stasjon/arendal_stasjon.json#arendal_stasjon: stort område uten coordNote/coordStatus
- data/places/by/agder/grimstad_stasjon_grimstadbanen/grimstad_stasjon_grimstadbanen.json#grimstad_stasjon_grimstadbanen: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/agder/tonstad_kraftverk_sirdal/tonstad_kraftverk_sirdal.json#tonstad_kraftverk_sirdal: stort område uten coordNote/coordStatus
- data/places/vitenskap/agder/kristiansand_katedralskole/kristiansand_katedralskole.json#kristiansand_katedralskole: lineært sted uten anchors
- data/places/vitenskap/agder/kristiansand_katedralskole/kristiansand_katedralskole.json#kristiansand_katedralskole: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/agder/lund_batteri_kristiansand/lund_batteri_kristiansand.json#lund_batteri_kristiansand: lineært sted uten anchors
- data/places/by/agder/trefoldighetskirken_arendal/trefoldighetskirken_arendal.json#trefoldighetskirken_arendal: stort område uten coordNote/coordStatus
- data/places/historie/agder/flosta_kirke_arendal/flosta_kirke_arendal.json#flosta_kirke_arendal: stort område uten coordNote/coordStatus
- data/places/by/agder/flekkefjord_kirke_byhistorie/flekkefjord_kirke_byhistorie.json#flekkefjord_kirke_byhistorie: stort område uten coordNote/coordStatus
- data/places/natur/agder/justoy_kystkultur_lillesand/justoy_kystkultur_lillesand.json#justoy_kystkultur_lillesand: stort område uten coordNote/coordStatus
- data/places/historie/agder/tingvatn_fornminnepark_haegebostad/tingvatn_fornminnepark_haegebostad.json#tingvatn_fornminnepark_haegebostad: stort område uten coordNote/coordStatus
- data/places/natur/agder/ravnedalen_kristiansand/ravnedalen_kristiansand.json#ravnedalen_kristiansand: lineært sted uten anchors
- data/places/natur/agder/ravnedalen_kristiansand/ravnedalen_kristiansand.json#ravnedalen_kristiansand: stort område uten coordNote/coordStatus
- data/places/by/agder/fullriggeren_sorlandet_kristiansand/fullriggeren_sorlandet_kristiansand.json#fullriggeren_sorlandet_kristiansand: lineært sted uten anchors
- data/places/by/agder/fullriggeren_sorlandet_kristiansand/fullriggeren_sorlandet_kristiansand.json#fullriggeren_sorlandet_kristiansand: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/agder/pusnes_mekaniske_verksted_arendal/pusnes_mekaniske_verksted_arendal.json#pusnes_mekaniske_verksted_arendal: stort område uten coordNote/coordStatus
- data/places/by/agder/arendal_tollbod/arendal_tollbod.json#arendal_tollbod: stort område uten coordNote/coordStatus
- data/places/natur/agder/furulunden_mandal_kulturpark/furulunden_mandal_kulturpark.json#furulunden_mandal_kulturpark: stort område uten coordNote/coordStatus
- data/places/historie/agder/kristiansand_kanonmuseum_movik/kristiansand_kanonmuseum_movik.json#kristiansand_kanonmuseum_movik: lineært sted uten anchors
- data/places/vitenskap/agder/evje_mineralsti/evje_mineralsti.json#evje_mineralsti: lineært sted uten anchors
- data/places/vitenskap/agder/setesdal_mineralpark_evje/setesdal_mineralpark_evje.json#setesdal_mineralpark_evje: stort område uten coordNote/coordStatus
- data/places/historie/agder/arendal_sjofartsmuseum/arendal_sjofartsmuseum.json#arendal_sjofartsmuseum: stort område uten coordNote/coordStatus
- data/places/historie/agder/boen_gard_kristiansand/boen_gard_kristiansand.json#boen_gard_kristiansand: lineært sted uten anchors
- data/places/by/agder/kristiansand_lufthavn_kjevik/kristiansand_lufthavn_kjevik.json#kristiansand_lufthavn_kjevik: lineært sted uten anchors
- data/places/natur/agder/skjernoy_kystkultur_lindesnes/skjernoy_kystkultur_lindesnes.json#skjernoy_kystkultur_lindesnes: stort område uten coordNote/coordStatus
- data/places/historie/agder/byremo_tingsted_lyngdal/byremo_tingsted_lyngdal.json#byremo_tingsted_lyngdal: stort område uten coordNote/coordStatus
- data/places/kunst/agder/arendal_kulturhus/arendal_kulturhus.json#arendal_kulturhus: stort område uten coordNote/coordStatus
- data/places/scenekunst/agder/kilden_teater_konserthus_kristiansand/kilden_teater_konserthus_kristiansand.json#kilden_teater_konserthus_kristiansand: lineært sted uten anchors
- data/places/by/agder/fiskebrygga_kristiansand/fiskebrygga_kristiansand.json#fiskebrygga_kristiansand: lineært sted uten anchors
- data/places/natur/agder/baneheia_kristiansand_bypark/baneheia_kristiansand_bypark.json#baneheia_kristiansand_bypark: lineært sted uten anchors
- data/places/natur/agder/baneheia_kristiansand_bypark/baneheia_kristiansand_bypark.json#baneheia_kristiansand_bypark: stort område uten coordNote/coordStatus
- data/places/naeringsliv/agder/laudal_kraftverk_lindesnes/laudal_kraftverk_lindesnes.json#laudal_kraftverk_lindesnes: stort område uten coordNote/coordStatus
- data/places/by/agder/audnedal_stasjon_lyngdal/audnedal_stasjon_lyngdal.json#audnedal_stasjon_lyngdal: stort område uten coordNote/coordStatus
- data/places/by/agder/audnedal_stasjon_lyngdal/audnedal_stasjon_lyngdal.json#audnedal_stasjon_lyngdal: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch1/stiklestad.json#stiklestad: lineært sted uten anchors
- data/places/historie/norge/places_historie_norge_for_1500_batch1/stiklestad.json#stiklestad: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch3/sekken_slagsted.json#sekken_slagsted: lav koordinatpresisjon (<4 desimaler)
- data/places/by/nordland/vagar_lofoten_storvagan/vagar_lofoten_storvagan.json#vagar_lofoten_storvagan: lineært sted uten anchors
- data/places/historie/norge/places_historie_norge_for_1500_batch4/holmengra_hvaler.json#holmengra_hvaler: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch4/stamford_bridge_battlefield.json#stamford_bridge_battlefield: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch4/jelling_kongsgard.json#jelling_kongsgard: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/norge/places_historie_norge_for_1500_batch4/orkney_birsay.json#orkney_birsay: lav koordinatpresisjon (<4 desimaler)
- data/places/kunst/oslo/places_kunst/nasjonalmuseet.json#nasjonalmuseet: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/astrup_fearnley.json#astrup_fearnley: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur/nasjonalbiblioteket.json#nasjonalbiblioteket: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur/grotta.json#grotta: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur/litteraturhuset.json#litteraturhuset: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur/tronsmo_bokhandel.json#tronsmo_bokhandel: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur/eldorado_bokhandel.json#eldorado_bokhandel: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur/gamle_deichman.json#gamle_deichman: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur/deichman_grunerlokka.json#deichman_grunerlokka: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur/kulturkirken_jakob_litteratur.json#kulturkirken_jakob_litteratur: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur/ruth_maier_minne.json#ruth_maier_minne: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur/inger_hagerups_plass.json#inger_hagerups_plass: coordStatus=verified uten coordPrecisionM
- data/places/media/oslo/places_oslo_media/vg_huset.json#vg_huset: coordStatus=verified uten coordPrecisionM
- data/places/media/oslo/places_oslo_media/nrk_huset_marienlyst.json#nrk_huset_marienlyst: coordStatus=verified uten coordPrecisionM
- data/places/media/oslo/places_oslo_media/klassekampen_redaksjon.json#klassekampen_redaksjon: coordStatus=verified uten coordPrecisionM
- data/places/musikk/oslo/places_musikk/rockefeller.json#rockefeller: coordStatus=verified uten coordPrecisionM
- data/places/musikk/oslo/places_musikk/john_dee.json#john_dee: coordStatus=verified uten coordPrecisionM
- data/places/musikk/oslo/places_musikk/sentrum_scene.json#sentrum_scene: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv/havnelageret.json#havnelageret: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv/oslo_posthus.json#oslo_posthus: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv/vinmonopolet_lager.json#vinmonopolet_lager: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv/jernbaneverkstedet_lodalen.json#jernbaneverkstedet_lodalen: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv/grunnlovsbygget_bankplassen.json#grunnlovsbygget_bankplassen: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv/ulven_handelspark.json#ulven_handelspark: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv/schous_bryggeri.json#schous_bryggeri: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv/ringnes_bryggeri.json#ringnes_bryggeri: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv/oslo_kraftselskap.json#oslo_kraftselskap: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv/vippetangen_fisketorg.json#vippetangen_fisketorg: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv/christiania_seildugsfabrik.json#christiania_seildugsfabrik: lineært sted uten anchors
- data/places/naeringsliv/oslo/places_naeringsliv/christiania_seildugsfabrik.json#christiania_seildugsfabrik: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv/lilleborg_fabrikker.json#lilleborg_fabrikker: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/places_oslo_alna/alnaelvstien.json#alnaelvstien: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_akerselvarute/stilla_nydalen.json#stilla_nydalen: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_akerselvarute/glads_molle.json#glads_molle: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/places_oslo_natur_akerselvarute/voien_gard_voienvolden.json#voien_gard_voienvolden: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/places_oslo_natur_akerselvarute/vulkan_industriomrade.json#vulkan_industriomrade: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/places_oslo_natur_akerselvarute/elvestrekning_bla_brenneriveien.json#elvestrekning_bla_brenneriveien: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_akerselvarute/fossveien_elvestrekning.json#fossveien_elvestrekning: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_akerselvarute/hausmannsomradet_elvelop.json#hausmannsomradet_elvelop: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_hovedsteder/alnaelva_hovedsteder.json#alnaelva_hovedsteder: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_skullerud.json#ljanselva_skullerud: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_hauketo.json#ljanselva_hauketo: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_ljan.json#ljanselva_ljan: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_fiskevollen.json#ljanselva_fiskevollen: lineært sted uten anchors
- data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_bunnefjorden.json#ljanselva_bunnefjorden: lineært sted uten anchors
- data/places/politikk/oslo/places_politikk/stortinget.json#stortinget: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk/oslo_radhus.json#oslo_radhus: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk/tinghuset.json#tinghuset: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk/hoyesteretts_hus.json#hoyesteretts_hus: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk/politihuset_gronland.json#politihuset_gronland: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk/folkets_hus_oslo.json#folkets_hus_oslo: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk/22_juli_senteret.json#22_juli_senteret: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk/victoria_terrasse.json#victoria_terrasse: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk/statsministerboligen.json#statsministerboligen: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk/hoyres_hus.json#hoyres_hus: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/oslo_sport/kfum_arena.json#kfum_arena: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/oslo_sport/nordre_aasen_idrettspark.json#nordre_aasen_idrettspark: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/places_motorsport_ostlandet/rudskogen_motorsenter.json#rudskogen_motorsenter: stort område uten coordNote/coordStatus
- data/places/sport/europa/norway/places_motorsport_ostlandet/gardermoen_motorpark.json#gardermoen_motorpark: stort område uten coordNote/coordStatus
- data/places/sport/europa/norway/places_motorsport_ostlandet/finnskogbanen.json#finnskogbanen: stort område uten coordNote/coordStatus
- data/places/sport/europa/england/footballgrounds_london/wembley_stadium_london.json#wembley_stadium_london: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/europa/england/footballgrounds_london/stamford_bridge_london.json#stamford_bridge_london: lav koordinatpresisjon (<4 desimaler)
- data/places/subkultur/oslo/places_subkultur/hausmania.json#hausmania: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/skur13.json#skur13: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/torggata_blad.json#torggata_blad: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/schweigaards_gate_lodalen.json#schweigaards_gate_lodalen: lineært sted uten anchors
- data/places/subkultur/oslo/places_subkultur/kuba_akselpassasjer.json#kuba_akselpassasjer: lineært sted uten anchors
- data/places/subkultur/oslo/places_subkultur/blitzhuset.json#blitzhuset: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/kafe_haerverk.json#kafe_haerverk: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/brenneriveien_ingens_gate.json#brenneriveien_ingens_gate: lineært sted uten anchors
- data/places/subkultur/oslo/places_subkultur/brenneriveien_ingens_gate.json#brenneriveien_ingens_gate: lav koordinatpresisjon (<4 desimaler)
- data/places/subkultur/oslo/places_subkultur/gamlebyen_sport_og_fritid.json#gamlebyen_sport_og_fritid: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/oslo_skatehall.json#oslo_skatehall: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/xray_ungdomskulturhus.json#xray_ungdomskulturhus: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/vaterland_bar_scene.json#vaterland_bar_scene: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/helvete_neseblod_records.json#helvete_neseblod_records: lineært sted uten anchors
- data/places/subkultur/oslo/places_subkultur/last_train_oslo.json#last_train_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/rock_in_oslo.json#rock_in_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/revolver_oslo.json#revolver_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/the_villa.json#the_villa: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/jaeger_oslo.json#jaeger_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/sub_scene.json#sub_scene: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/mir_grunerlokka_lufthavn.json#mir_grunerlokka_lufthavn: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/prindsen_mottakssenter.json#prindsen_mottakssenter: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/fyrlyset_oslo.json#fyrlyset_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/evangeliesenteret_kontaktsenter_oslo.json#evangeliesenteret_kontaktsenter_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/brugata_storgata_rusmiljo.json#brugata_storgata_rusmiljo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/huset_oslo.json#huset_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/nadheim_oslo.json#nadheim_oslo: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/places_subkultur/motestedet_tollbugata.json#motestedet_tollbugata: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/universitetets_gamle_hovedbygning.json#universitetets_gamle_hovedbygning: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/universitetets_gamle_kjemi.json#universitetets_gamle_kjemi: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/tvergastein.json#tvergastein: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/gamlebyen_skole.json#gamlebyen_skole: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/universitetet_i_oslo_blindern.json#universitetet_i_oslo_blindern: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/naturhistorisk_museum.json#naturhistorisk_museum: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/teknisk_museum.json#teknisk_museum: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/rikshospitalet.json#rikshospitalet: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/radiumhospitalet.json#radiumhospitalet: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/meteorologisk_institutt.json#meteorologisk_institutt: lineært sted uten anchors
- data/places/vitenskap/oslo/places_vitenskap/meteorologisk_institutt.json#meteorologisk_institutt: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/oslo_met_pilestredet.json#oslo_met_pilestredet: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/arkitektur_og_designhogskolen.json#arkitektur_og_designhogskolen: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/bi_nydalen.json#bi_nydalen: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner/nobelinstituttet.json#nobelinstituttet: lineært sted uten anchors
- data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner/nobelinstituttet.json#nobelinstituttet: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner/observatoriet.json#observatoriet: coordStatus=verified uten coordPrecisionM
- data/places/psykologi/oslo/places_psykologi/psykologisk_institutt_uio.json#psykologisk_institutt_uio: lineært sted uten anchors
- data/places/psykologi/oslo/places_psykologi/psykologisk_institutt_uio.json#psykologisk_institutt_uio: coordStatus=verified uten coordPrecisionM
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_alfama.json#lisbon_alfama: lav koordinatpresisjon (<4 desimaler)
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_lapa.json#lisbon_lapa: lav koordinatpresisjon (<4 desimaler)
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_ajuda.json#lisbon_ajuda: lav koordinatpresisjon (<4 desimaler)
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_martim_moniz_mouraria_axis.json#lisbon_martim_moniz_mouraria_axis: lav koordinatpresisjon (<4 desimaler)
- data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_gare_do_cais_do_sodre.json#lisbon_gare_do_cais_do_sodre: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_torre_de_belem.json#lisbon_torre_de_belem: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_se_de_lisboa.json#lisbon_se_de_lisboa: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_palacio_fronteira.json#lisbon_palacio_fronteira: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_igreja_de_santo_antonio.json#lisbon_igreja_de_santo_antonio: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_museu_do_aljube.json#lisbon_museu_do_aljube: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_museu_de_marinha.json#lisbon_museu_de_marinha: lav koordinatpresisjon (<4 desimaler)
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_praca_marques_de_pombal.json#lisbon_praca_marques_de_pombal: lav koordinatpresisjon (<4 desimaler)
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_praca_do_municipio.json#lisbon_praca_do_municipio: lav koordinatpresisjon (<4 desimaler)
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_tribunal_constitucional.json#lisbon_tribunal_constitucional: lineært sted uten anchors
- data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_avenida_24_de_julho.json#lisbon_avenida_24_de_julho: lav koordinatpresisjon (<4 desimaler)
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_centro_cultural_de_belem.json#lisbon_centro_cultural_de_belem: lav koordinatpresisjon (<4 desimaler)
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_museu_do_oriente.json#lisbon_museu_do_oriente: lav koordinatpresisjon (<4 desimaler)
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_museu_arpad_szenes_vieira_da_silva.json#lisbon_museu_arpad_szenes_vieira_da_silva: lav koordinatpresisjon (<4 desimaler)
- data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_museu_bordalo_pinheiro.json#lisbon_museu_bordalo_pinheiro: lav koordinatpresisjon (<4 desimaler)
- data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur/lisbon_gremio_literario.json#lisbon_gremio_literario: lav koordinatpresisjon (<4 desimaler)
- data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk/lisbon_clube_de_fado.json#lisbon_clube_de_fado: lav koordinatpresisjon (<4 desimaler)
- data/places/scenekunst/europe/portugal/lisbon/places_lisbon_scenekunst/lisbon_teatro_nacional_d_maria_ii.json#lisbon_teatro_nacional_d_maria_ii: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_parque_das_nacoes.json#lisbon_parque_das_nacoes: lav koordinatpresisjon (<4 desimaler)
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_conserveira_de_lisboa.json#lisbon_conserveira_de_lisboa: lineært sted uten anchors
- data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_santa_apolonia_station.json#lisbon_santa_apolonia_station: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/europa/portugal/sportvenues_lisbon/lisbon_centro_nautico_de_belem.json#lisbon_centro_nautico_de_belem: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_miradouro_da_senhora_do_monte.json#lisbon_miradouro_da_senhora_do_monte: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_tapada_da_ajuda.json#lisbon_tapada_da_ajuda: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_jardim_gulbenkian.json#lisbon_jardim_gulbenkian: lav koordinatpresisjon (<4 desimaler)
- data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_cinema_ideal.json#lisbon_cinema_ideal: lav koordinatpresisjon (<4 desimaler)
- data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_tobis_portuguesa.json#lisbon_tobis_portuguesa: lav koordinatpresisjon (<4 desimaler)
- data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_doclisboa.json#lisbon_doclisboa: lineært sted uten anchors
- data/places/media/europe/portugal/lisbon/places_lisbon_media/lisbon_rtp.json#lisbon_rtp: lav koordinatpresisjon (<4 desimaler)
- data/places/media/europe/portugal/lisbon/places_lisbon_media/lisbon_arquivo_rtp.json#lisbon_arquivo_rtp: lav koordinatpresisjon (<4 desimaler)
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_instituto_superior_tecnico.json#lisbon_instituto_superior_tecnico: lineært sted uten anchors
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_instituto_higiene_medicina_tropical.json#lisbon_instituto_higiene_medicina_tropical: lineært sted uten anchors
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_instituto_higiene_medicina_tropical.json#lisbon_instituto_higiene_medicina_tropical: lav koordinatpresisjon (<4 desimaler)
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_instituto_ricardo_jorge.json#lisbon_instituto_ricardo_jorge: lineært sted uten anchors
- data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_champalimaud_foundation.json#lisbon_champalimaud_foundation: lav koordinatpresisjon (<4 desimaler)
- data/places/historie/vestland/etne/stodle_kyrkje.json#stodle_kyrkje: coordStatus=verified uten coordPrecisionM
- data/places/historie/vestland/etne/saebotunet_etne.json#saebotunet_etne: coordStatus=verified uten coordPrecisionM
- data/places/historie/vestland/etne/gjerde_kyrkje_etne.json#gjerde_kyrkje_etne: coordStatus=verified uten coordPrecisionM
- data/places/historie/vestland/etne/grindheim_kyrkje_etne.json#grindheim_kyrkje_etne: coordStatus=verified uten coordPrecisionM
- data/places/historie/vestland/etne/bruteigsteinen_etne.json#bruteigsteinen_etne: lineært sted uten anchors
- data/places/historie/vestland/etne/skanevik_gjestgjevargarden.json#skanevik_gjestgjevargarden: coordStatus=verified uten coordPrecisionM
- data/places/historie/vestland/etne/reichwald_snublesteiner_skanevik.json#reichwald_snublesteiner_skanevik: coordStatus=verified uten coordPrecisionM
- data/places/historie/vestland/etne/etne_prestebustad.json#etne_prestebustad: coordStatus=verified uten coordPrecisionM
- data/places/historie/vestland/etne/fjaera_kapell.json#fjaera_kapell: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/vestland/etne/litledalen_kraftverk/litledalen_kraftverk.json#litledalen_kraftverk: lav koordinatpresisjon (<4 desimaler)
- data/places/by/vestland/etne/kyrping_handelsstad/kyrping_handelsstad.json#kyrping_handelsstad: lav koordinatpresisjon (<4 desimaler)
- data/places/kunst/vestland/etne/skanevik_fjordhotel_pippifestivalen/skanevik_fjordhotel_pippifestivalen.json#skanevik_fjordhotel_pippifestivalen: lineært sted uten anchors
- data/places/sport/vestland/etne/skanevik_idrettsanlegg/skanevik_idrettsanlegg.json#skanevik_idrettsanlegg: lav koordinatpresisjon (<4 desimaler)
- data/places/sport/vestland/etne/etne_bmx_og_skatepark/etne_bmx_og_skatepark.json#etne_bmx_og_skatepark: stort område uten coordNote/coordStatus
- data/places/sport/vestland/etne/skanevik_skatepark/skanevik_skatepark.json#skanevik_skatepark: lav koordinatpresisjon (<4 desimaler)
- data/places/politikk/vestland/etne/etne_tinghus.json#etne_tinghus: coordStatus=verified uten coordPrecisionM
- data/places/politikk/vestland/etne/etne_brannstasjon.json#etne_brannstasjon: coordStatus=verified uten coordPrecisionM
- data/places/politikk/vestland/etne/skanevik_brannstasjon.json#skanevik_brannstasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/vestland/etneelva/etneelva.json#etneelva: lineært sted uten anchors
- data/places/natur/rogaland/vikedalselva/vikedalselva.json#vikedalselva: lineært sted uten anchors
- data/places/natur/rogaland/vikedalselva/vikedalselva.json#vikedalselva: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/rogaland/suldalslagen/suldalslagen.json#suldalslagen: lav koordinatpresisjon (<4 desimaler)
- data/places/vitenskap/vestland/etne/etneelva_forskningsplattform/etneelva_forskningsplattform.json#etneelva_forskningsplattform: lineært sted uten anchors
- data/places/media/vestland/etne/grannar_redaksjon_etne/grannar_redaksjon_etne.json#grannar_redaksjon_etne: coordStatus=verified uten coordPrecisionM
- data/places/psykologi/vestland/etne/psykisk_helse_rus_etne/psykisk_helse_rus_etne.json#psykisk_helse_rus_etne: coordStatus=verified uten coordPrecisionM
- data/places/psykologi/vestland/etne/psykisk_helse_rus_skanevik/psykisk_helse_rus_skanevik.json#psykisk_helse_rus_skanevik: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05/frammuseet.json#frammuseet: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05/kon_tiki_museet.json#kon_tiki_museet: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06/nordisk_bibelmuseum.json#nordisk_bibelmuseum: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_atlas_obscura_flop_batch_07/flop_museum.json#flop_museum: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap_oslo_kultureiendommer_batch_01/folkeobservatoriet_holmenkollen.json#folkeobservatoriet_holmenkollen: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/places_oslo_kultureiendommer_batch_01/kjeglebanen_langgaardslokken.json#kjeglebanen_langgaardslokken: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_02/radmannsgarden_og_anatomibygget.json#radmannsgarden_og_anatomibygget: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_02/magistratgarden.json#magistratgarden: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03/hauges_minde.json#hauges_minde: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03/slurpen_lakkegata.json#slurpen_lakkegata: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04/geitmyra_gard.json#geitmyra_gard: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04/gronland_politistasjon.json#gronland_politistasjon: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04/toyen_trafo.json#toyen_trafo: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur_oslo_kultureiendommer_batch_05/honse_lovisas_hus.json#honse_lovisas_hus: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_05/sagene_festivitetshus.json#sagene_festivitetshus: lineært sted uten anchors
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_05/sagene_festivitetshus.json#sagene_festivitetshus: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_05/etterstadgata_6.json#etterstadgata_6: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_05/villa_furulund.json#villa_furulund: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_06/villa_romsli.json#villa_romsli: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_07/stubljan_paviljongen_hvervenbukta.json#stubljan_paviljongen_hvervenbukta: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_08/trosterudvillaen.json#trosterudvillaen: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/sporveismuseet.json#sporveismuseet: lineært sted uten anchors
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/sporveismuseet.json#sporveismuseet: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/saxegarden.json#saxegarden: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/ovre_fossum_gard.json#ovre_fossum_gard: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/lambertseter_gard.json#lambertseter_gard: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/nordre_skoyen_hovedgard.json#nordre_skoyen_hovedgard: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/lokomotivverkstedet.json#lokomotivverkstedet: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/tveten_gard.json#tveten_gard: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_13/frysja_33_brekke_kraftstasjon.json#frysja_33_brekke_kraftstasjon: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/steen_og_strom.json#steen_og_strom: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/centralbanken_kirkegata.json#centralbanken_kirkegata: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/kafe_grei.json#kafe_grei: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/borsen_oslo.json#borsen_oslo: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/treschowgarden.json#treschowgarden: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01/kirkeristen_basarene_brannvakten.json#kirkeristen_basarene_brannvakten: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01/den_gamle_krigsskolen.json#den_gamle_krigsskolen: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02/hotel_du_nord.json#hotel_du_nord: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02/cafe_engebret.json#cafe_engebret: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/garmanngarden.json#garmanngarden: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/stattholdergarden.json#stattholdergarden: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/waisenhuset_kongens_gate.json#waisenhuset_kongens_gate: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/myntgatakvartalet.json#myntgatakvartalet: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03/amerikalinjen.json#amerikalinjen: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03/dfds_bygget.json#dfds_bygget: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04/norges_bank_bankplassen_4.json#norges_bank_bankplassen_4: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_art_sites_batch_01/mustadgarden_kongens_gate_3.json#mustadgarden_kongens_gate_3: lineært sted uten anchors
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_art_sites_batch_01/mustadgarden_kongens_gate_3.json#mustadgarden_kongens_gate_3: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_hovedstaden_batch_01/avisen_tiden_radhusgata_10.json#avisen_tiden_radhusgata_10: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_hovedstaden_batch_01/sjofartsbygningen.json#sjofartsbygningen: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_hovedstaden_batch_02/schiollgarden_prinsens_gate_26.json#schiollgarden_prinsens_gate_26: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_under_bakken_batch_01/norges_bank_bankplassen_2.json#norges_bank_bankplassen_2: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_stil_arkitektur_batch_01/kirkegata_5.json#kirkegata_5: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur_oslo_bla_skilt_2026_batch_01/bla_skilt_stein_mehren_ullevalsveien_60.json#bla_skilt_stein_mehren_ullevalsveien_60: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/places_politikk_oslo_bla_skilt_2026_batch_01/bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5.json#bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01/bla_skilt_helverschous_lokke_munkedamsveien_35.json#bla_skilt_helverschous_lokke_munkedamsveien_35: lineært sted uten anchors
- data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01/bla_skilt_helverschous_lokke_munkedamsveien_35.json#bla_skilt_helverschous_lokke_munkedamsveien_35: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01/bla_skilt_enerhaugen_samfund_smedgata_34.json#bla_skilt_enerhaugen_samfund_smedgata_34: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/norsk_folkemuseum.json#norsk_folkemuseum: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/norsk_maritimt_museum.json#norsk_maritimt_museum: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/historisk_museum.json#historisk_museum: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/frogner_hovedgard.json#frogner_hovedgard: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/arbeidermuseet.json#arbeidermuseet: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/nobels_fredssenter.json#nobels_fredssenter: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/kunstnernes_hus.json#kunstnernes_hus: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/vigelandmuseet.json#vigelandmuseet: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/mollergata_skole.json#mollergata_skole: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/tbs_gallery.json#tbs_gallery: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/viking_planet_oslo.json#viking_planet_oslo: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv/the_salmon_vitensenter.json#the_salmon_vitensenter: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/jodisk_museum_oslo.json#jodisk_museum_oslo: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/det_internasjonale_barnekunstmuseet.json#det_internasjonale_barnekunstmuseet: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur/ibsen_museum_teater.json#ibsen_museum_teater: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/oslo_reptilpark.json#oslo_reptilpark: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/oslo_sport/toyenbadet.json#toyenbadet: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/oslo_sport/ekt_rideskole_husdyrpark.json#ekt_rideskole_husdyrpark: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/dronning_sonja_kunststall.json#dronning_sonja_kunststall: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/oslo_sport/holmlia_bad.json#holmlia_bad: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places/fagerborg_kirke.json#fagerborg_kirke: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places/uranienborg_kirke.json#uranienborg_kirke: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places/frogner_kirke.json#frogner_kirke: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/oslo_sport/skimore_oslo.json#skimore_oslo: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/brannmuseet_oslo.json#brannmuseet_oslo: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/oslo_sport/skoytemuseet.json#skoytemuseet: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places/kampen_okologiske_barnebondegard.json#kampen_okologiske_barnebondegard: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/klimahuset.json#klimahuset: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/fotografiens_hus.json#fotografiens_hus: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/christian_radich.json#christian_radich: lineært sted uten anchors
- data/places/historie/oslo/places_historie/christian_radich.json#christian_radich: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/central_jam_e_mosque.json#central_jam_e_mosque: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/toyen_hovedgard.json#toyen_hovedgard: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/museumsleiligheten_grabein.json#museumsleiligheten_grabein: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/oslo_sport/frigo_friluftssenteret.json#frigo_friluftssenteret: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/galleri_map.json#galleri_map: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/vi_vii_gallery.json#vi_vii_gallery: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/the_oslo_gallery.json#the_oslo_gallery: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/valerenga_kirke.json#valerenga_kirke: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/kunsthall_oslo.json#kunsthall_oslo: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/places_litteratur/biblo_toyen.json#biblo_toyen: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/ekebergparken_museum.json#ekebergparken_museum: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/kosk_oslo.json#kosk_oslo: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/galleri_mini_oslo.json#galleri_mini_oslo: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/van_etten.json#van_etten: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/oslo_prosjektrom.json#oslo_prosjektrom: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/paulus_kirke.json#paulus_kirke: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/purenkel_galleri.json#purenkel_galleri: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/oscarshall.json#oscarshall: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/vikingtidsmuseet.json#vikingtidsmuseet: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places/sukkerbiten_badstulandsby.json#sukkerbiten_badstulandsby: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/oslo_sport/friluftshuset_sorenga.json#friluftshuset_sorenga: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/places/holmenkollen_kapell.json#holmenkollen_kapell: coordStatus=verified uten coordPrecisionM
- data/places/sport/europa/norway/oslo_sport/oslo_golfklubb_bogstad.json#oslo_golfklubb_bogstad: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/holmenkollen_skimuseum.json#holmenkollen_skimuseum: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/vestland/den_nationale_scene/den_nationale_scene.json#den_nationale_scene: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/rogaland/rogaland_teater/rogaland_teater.json#rogaland_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/trondelag/trondelag_teater/trondelag_teater.json#trondelag_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/troms/halogaland_teater/halogaland_teater.json#halogaland_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/telemark/teater_ibsen/teater_ibsen.json#teater_ibsen: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/nordland/nordland_teater/nordland_teater.json#nordland_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/more_og_romsdal/teatret_vart_plassen/teatret_vart_plassen.json#teatret_vart_plassen: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/vestland/teater_vestland_nynorskhuset/teater_vestland_nynorskhuset.json#teater_vestland_nynorskhuset: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/vestland/det_vestnorske_teateret/det_vestnorske_teateret.json#det_vestnorske_teateret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/finnmark/beaivvas_coarvematta/beaivvas_coarvematta.json#beaivvas_coarvematta: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/trondelag/uffa_huset_trondheim/uffa_huset_trondheim.json#uffa_huset_trondheim: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/trondelag/ressurssenter_kvinner_trondheim/ressurssenter_kvinner_trondheim.json#ressurssenter_kvinner_trondheim: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/vestland/hulen_bergen/hulen_bergen.json#hulen_bergen: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/vestland/bergen_kjott_kulturhus/bergen_kjott_kulturhus.json#bergen_kjott_kulturhus: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/rogaland/tou_stavanger/tou_stavanger.json#tou_stavanger: coordStatus=verified uten coordPrecisionM
- data/places/sport/oslo/voldslokka_pumptrack/voldslokka_pumptrack.json#voldslokka_pumptrack: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/trondelag/trikkestallen_skatepark_trondheim/trikkestallen_skatepark_trondheim.json#trikkestallen_skatepark_trondheim: coordStatus=verified uten coordPrecisionM
- data/places/sport/vestland/fysak_slettebakken/fysak_slettebakken.json#fysak_slettebakken: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/akershus/arena_bekkestua/arena_bekkestua.json#arena_bekkestua: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/vestland/mo_senteret_gyldenpris/mo_senteret_gyldenpris.json#mo_senteret_gyldenpris: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/rogaland/matfellesskap_st_petri_stavanger/matfellesskap_st_petri_stavanger.json#matfellesskap_st_petri_stavanger: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/troms/kafe_x_tromso/kafe_x_tromso.json#kafe_x_tromso: coordStatus=verified uten coordPrecisionM
- data/places/religion/vestland/etne/etne_kyrkje/etne_kyrkje.json#etne_kyrkje: coordStatus=verified uten coordPrecisionM
- data/places/religion/vestland/etne/skanevik_kyrkje/skanevik_kyrkje.json#skanevik_kyrkje: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/buskerud/brageteatret_union_scene/brageteatret_union_scene.json#brageteatret_union_scene: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/rogaland/haugesund_teater_haut_scene/haugesund_teater_haut_scene.json#haugesund_teater_haut_scene: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/ostfold/ostfold_teater/ostfold_teater.json#ostfold_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/trondelag/turneteatret_i_trondelag/turneteatret_i_trondelag.json#turneteatret_i_trondelag: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/innlandet/teater_innlandet_hamar_kulturhus/teater_innlandet_hamar_kulturhus.json#teater_innlandet_hamar_kulturhus: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/agder/bruddet_fjaereheia/bruddet_fjaereheia.json#bruddet_fjaereheia: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/agder/teateret_kristiansand/teateret_kristiansand.json#teateret_kristiansand: lineært sted uten anchors
- data/places/scenekunst/agder/teateret_kristiansand/teateret_kristiansand.json#teateret_kristiansand: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/trondelag/rosendal_teater/rosendal_teater.json#rosendal_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/vestland/cornerteateret/cornerteateret.json#cornerteateret: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/vestland/studio_bergen_carte_blanche/studio_bergen_carte_blanche.json#studio_bergen_carte_blanche: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/akershus/baerum_kulturhus/baerum_kulturhus.json#baerum_kulturhus: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/buskerud/drammens_teater/drammens_teater.json#drammens_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/dramatikkens_hus/dramatikkens_hus.json#dramatikkens_hus: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/teater_manu/teater_manu.json#teater_manu: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/vega_scene/vega_scene.json#vega_scene: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/akershus/lille_scene_sandvika/lille_scene_sandvika.json#lille_scene_sandvika: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/akershus/sandvika_teater/sandvika_teater.json#sandvika_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/more_og_romsdal/fabrikken_kulturscene/fabrikken_kulturscene.json#fabrikken_kulturscene: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/rogaland/rimi_imir_scenekunst/rimi_imir_scenekunst.json#rimi_imir_scenekunst: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/vestfold/papirhuset_teater/papirhuset_teater.json#papirhuset_teater: coordStatus=verified uten coordPrecisionM
- data/places/natur/vestland/etne/mosneselva_etne/mosneselva_etne.json#mosneselva_etne: lineært sted uten anchors
- data/places/natur/vestland/etne/flateskar_stordalen/flateskar_stordalen.json#flateskar_stordalen: coordStatus=verified uten coordPrecisionM
- data/places/natur/vestland/etne/rullestadvatnet/rullestadvatnet.json#rullestadvatnet: coordStatus=verified uten coordPrecisionM
- data/places/natur/vestland/etne/vaulaelva_vassdraget/vaulaelva_vassdraget.json#vaulaelva_vassdraget: lineært sted uten anchors
- data/places/natur/vestland/etne/krokavatnet_etneforkastningen/krokavatnet_etneforkastningen.json#krokavatnet_etneforkastningen: coordStatus=verified uten coordPrecisionM
- data/places/natur/vestland/etne/sandvikevatnet_etne/sandvikevatnet_etne.json#sandvikevatnet_etne: coordStatus=verified uten coordPrecisionM
- data/places/natur/vestland/etne/taraldsoy/taraldsoy.json#taraldsoy: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/telemark/grenland_friteater/grenland_friteater.json#grenland_friteater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/finnmark/samovarteateret_sor_varanger_kultursal/samovarteateret_sor_varanger_kultursal.json#samovarteateret_sor_varanger_kultursal: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/troms/radstua_teaterhus/radstua_teaterhus.json#radstua_teaterhus: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/innlandet/hamar_teater/hamar_teater.json#hamar_teater: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/innlandet/radhus_teatret_kongsvinger/radhus_teatret_kongsvinger.json#radhus_teatret_kongsvinger: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/fotogalleriet.json#fotogalleriet: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/kunstnerforbundet.json#kunstnerforbundet: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/edvard_munchs_atelier_ekely.json#edvard_munchs_atelier_ekely: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/tegnerforbundet.json#tegnerforbundet: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/unge_kunstneres_samfund.json#unge_kunstneres_samfund: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/norske_grafikere.json#norske_grafikere: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/places_historie/the_mini_bottle_gallery.json#the_mini_bottle_gallery: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/galleri_lnm.json#galleri_lnm: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/ram_galleri.json#ram_galleri: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/galleri_schaeffers_gate_5.json#galleri_schaeffers_gate_5: lineært sted uten anchors
- data/places/kunst/oslo/places_kunst/galleri_schaeffers_gate_5.json#galleri_schaeffers_gate_5: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/places_kunst/grafill.json#grafill: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/akershus/akershus_energipark.json#akershus_energi: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/akershus/telenor_fornebu.json#fornebu_teknologipark: coordStatus=verified uten coordPrecisionM
- data/places/film_tv/oslo/cinemateket_oslo.json#cinemateket_oslo: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/europe/portugal/lisbon/lisbon_feira_do_livro.json#lisbon_feira_do_livro: lav koordinatpresisjon (<4 desimaler)
- data/places/media/oslo/grand_hotel.json#grand_hotel: coordStatus=verified uten coordPrecisionM
- data/places/religion/europe/portugal/lisbon/lisbon_santo_antonio_festival.json#lisbon_santo_antonio_festival: lineært sted uten anchors
- data/places/scenekunst/oslo/chateau_neuf.json#chateau_neuf: coordStatus=verified uten coordPrecisionM
- data/places/subkultur/oslo/house_of_nerds.json#house_of_nerds: coordStatus=verified uten coordPrecisionM
- data/places/scenekunst/oslo/bla_skilt_aud_schonemann_vetlandsveien_69d.json#bla_skilt_aud_schonemann_vetlandsveien_69d: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/bitraf.json#bitraf: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/radionette_fodested_bygdoy_alle_67.json#radionette_fodested_bygdoy_alle_67: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/sintef_minalab.json#sintef_minalab: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/stk_pex_kabeltarnet.json#stk_pex_kabeltarnet: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/places_vitenskap/tandbergs_radiofabrikk_kjelsas.json#tandbergs_radiofabrikk_kjelsas: coordStatus=verified uten coordPrecisionM
- data/places/by/agder/kristiansand/kristiansand.json#kristiansand: lineært sted uten anchors
- data/places/psykologi/oslo/places_psykologi/nkvts_nydalen.json#nkvts_nydalen: coordStatus=verified uten coordPrecisionM
- data/places/psykologi/oslo/places_psykologi/nic_waals_institutt.json#nic_waals_institutt: lineært sted uten anchors
- data/places/psykologi/oslo/places_psykologi/nic_waals_institutt.json#nic_waals_institutt: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/grefsen_gjenvinningsstasjon.json#grefsen_gjenvinningsstasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/haraldrud_gjenvinningsstasjon.json#haraldrud_gjenvinningsstasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/ryen_gjenvinningsstasjon.json#ryen_gjenvinningsstasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/smestad_gjenvinningsstasjon.json#smestad_gjenvinningsstasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/lindeberg_gjenvinningsstasjon.json#lindeberg_gjenvinningsstasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/kampen_gjenvinningsstasjon.json#kampen_gjenvinningsstasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/romsas_gjenvinningsstasjon.json#romsas_gjenvinningsstasjon: lav koordinatpresisjon (<4 desimaler)
- data/places/natur/oslo/miljo_gjenbruk/sofienbergparken_gjenvinningsstasjon.json#sofienbergparken_gjenvinningsstasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/trosterud_gjenvinningsstasjon.json#trosterud_gjenvinningsstasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/haraldrud_ombrukstelt.json#haraldrud_ombrukstelt: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/gronmo_ombrukstelt.json#gronmo_ombrukstelt: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/lesekiosk/lesekiosk_42_munkedamsveien.json#lesekiosk_42_munkedamsveien: lineært sted uten anchors
- data/places/natur/oslo/miljo_gjenbruk/gronmo_gjenvinningsstasjon.json#gronmo_gjenvinningsstasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/sorenga_gjenvinningsstasjon.json#sorenga_gjenvinningsstasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/bygdoy_miljostasjon.json#bygdoy_miljostasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/frysja_miljostasjon.json#frysja_miljostasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/kringsja_miljostasjon.json#kringsja_miljostasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/lambertseter_miljostasjon.json#lambertseter_miljostasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/lindebergasen_miljostasjon.json#lindebergasen_miljostasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/lindoya_miljostasjon.json#lindoya_miljostasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/mosseveien_miljostasjon.json#mosseveien_miljostasjon: lineært sted uten anchors
- data/places/natur/oslo/miljo_gjenbruk/mosseveien_miljostasjon.json#mosseveien_miljostasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/munkerud_miljostasjon.json#munkerud_miljostasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/oppsal_miljostasjon.json#oppsal_miljostasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/skjonhaug_miljostasjon.json#skjonhaug_miljostasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/sogn_miljostasjon.json#sogn_miljostasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/tveita_miljostasjon.json#tveita_miljostasjon: lineært sted uten anchors
- data/places/natur/oslo/miljo_gjenbruk/tveita_miljostasjon.json#tveita_miljostasjon: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/ulven_miljostasjon.json#ulven_miljostasjon: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/bla_skilt/bla_skilt_gartnerlokka_urtegata_50.json#bla_skilt_gartnerlokka_urtegata_50: coordStatus=verified uten coordPrecisionM
- data/places/helse/oslo/bla_skilt/bla_skilt_cathinka_guldberg_lovisenberggata_15a.json#bla_skilt_cathinka_guldberg_lovisenberggata_15a: coordStatus=verified uten coordPrecisionM
- data/places/helse/oslo/bla_skilt/bla_skilt_sulpen_keysers_gate_5.json#bla_skilt_sulpen_keysers_gate_5: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/bla_skilt/bla_skilt_vebjorn_tandberg_kongens_gate_15.json#bla_skilt_vebjorn_tandberg_kongens_gate_15: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/snublestein/snublestein_rebekka_blatt_nordre_gate_13.json#snublestein_rebekka_blatt_nordre_gate_13: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/snublestein/snublestein_fanny_steinsapir_bjerregaards_gate_68.json#snublestein_fanny_steinsapir_bjerregaards_gate_68: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/snublestein/snublestein_benno_damelin_schonings_gate_14.json#snublestein_benno_damelin_schonings_gate_14: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/snublestein/snublestein_salomon_bogomolno_d_y_jens_bjelkes_gate_64.json#snublestein_salomon_bogomolno_d_y_jens_bjelkes_gate_64: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/snublestein/snublestein_harry_isidor_mendel_ullevalsveien_97.json#snublestein_harry_isidor_mendel_ullevalsveien_97: coordStatus=verified uten coordPrecisionM
- data/places/historie/oslo/snublestein/snublestein_isak_kaplan_kirkegardsgata_2.json#snublestein_isak_kaplan_kirkegardsgata_2: coordStatus=verified uten coordPrecisionM
- data/places/natur/oslo/miljo_gjenbruk/hoybraten_miljostasjon.json#hoybraten_miljostasjon: coordStatus=verified uten coordPrecisionM
- data/places/sport/oslo/bla_skilt/bla_skilt_kjeglebanen_briskebyveien_21.json#bla_skilt_kjeglebanen_briskebyveien_21: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/bla_skilt/bla_skilt_fredrikke_qvam_pilestredet_81.json#bla_skilt_fredrikke_qvam_pilestredet_81: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/bla_skilt/bla_skilt_sophie_borchgrevink_cort_adelers_gate_33.json#bla_skilt_sophie_borchgrevink_cort_adelers_gate_33: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/bla_skilt/bla_skilt_universal_presentkort_lille_grensen_7.json#bla_skilt_universal_presentkort_lille_grensen_7: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/bla_skilt/bla_skilt_inger_sitter_president_harbitz_gate_19b.json#bla_skilt_inger_sitter_president_harbitz_gate_19b: coordStatus=verified uten coordPrecisionM
- data/places/kunst/oslo/bla_skilt/bla_skilt_per_ung_jarlsborgveien_12a.json#bla_skilt_per_ung_jarlsborgveien_12a: coordStatus=verified uten coordPrecisionM
- data/places/musikk/oslo/bla_skilt/bla_skilt_robert_levin_gabels_gate_46b.json#bla_skilt_robert_levin_gabels_gate_46b: coordStatus=verified uten coordPrecisionM
- data/places/utdanning/oslo/bla_skilt/bla_skilt_helga_eng_waldemar_thranes_gate_42.json#bla_skilt_helga_eng_waldemar_thranes_gate_42: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/bla_skilt/bla_skilt_thekla_resvoll_bestum_tverrvei_1.json#bla_skilt_thekla_resvoll_bestum_tverrvei_1: coordStatus=verified uten coordPrecisionM
- data/places/litteratur/oslo/bla_skilt/bla_skilt_anne_cath_vestly_wergelandsveien_7.json#bla_skilt_anne_cath_vestly_wergelandsveien_7: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/bla_skilt/bla_skilt_krisesenteret_camilla_waldemar_thranes_gate_70.json#bla_skilt_krisesenteret_camilla_waldemar_thranes_gate_70: coordStatus=verified uten coordPrecisionM
- data/places/vitenskap/oslo/bla_skilt/bla_skilt_eyde_birkeland_bolteloekka_alle_10.json#bla_skilt_eyde_birkeland_bolteloekka_alle_10: coordStatus=verified uten coordPrecisionM
- data/places/by/oslo/bla_skilt/bla_skilt_holmenkollen_sanatorium_kongeveien_26.json#bla_skilt_holmenkollen_sanatorium_kongeveien_26: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/bla_skilt/bla_skilt_kim_friele_haakon_tveters_vei_12.json#bla_skilt_kim_friele_haakon_tveters_vei_12: coordStatus=verified uten coordPrecisionM
- data/places/helse/oslo/bla_skilt/bla_skilt_elisabet_helsing_thor_olsens_gate_10.json#bla_skilt_elisabet_helsing_thor_olsens_gate_10: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/bla_skilt/bla_skilt_marcus_thrane_fredriksborgveien_18.json#bla_skilt_marcus_thrane_fredriksborgveien_18: coordStatus=verified uten coordPrecisionM
- data/places/politikk/oslo/bla_skilt/bla_skilt_anna_rogstad_henrichsens_gate_3.json#bla_skilt_anna_rogstad_henrichsens_gate_3: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/bla_skilt/bla_skilt_astri_stockfleth_sofies_gate_74.json#bla_skilt_astri_stockfleth_sofies_gate_74: coordStatus=verified uten coordPrecisionM
- data/places/naeringsliv/oslo/places_naeringsliv/freia_fabrikken.json#freia_fabrikken: coordStatus=verified uten coordPrecisionM

## Coordinate review candidates

Totalt 808 signaler fordelt på 703 steder. Et sted kan ha flere signaler. Kandidatene under er gruppert etter grunn.

### Antall per grunn

| Grunn | Antall |
| --- | --- |
| coordStatus=verified uten coordPrecisionM | 392 |
| lineært sted uten anchors | 84 |
| lav koordinatpresisjon (<4 desimaler) | 72 |
| svært stor r (>=500 m) uten coordNote | 66 |
| park/stort område uten anchors eller coordNote | 115 |
| stasjon/park/gate/torg/elv uten coordinate metadata | 58 |
| svært liten r (<60 m) for sted som ser utstrakt ut | 11 |
| identisk/nesten identisk lat/lon som annet sted uten forklaring | 10 |

### coordStatus=verified uten coordPrecisionM (392)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gronland_basarene | Grønland basarene | by | data/places/by/oslo/places/gronland_basarene.json | 59.91278287002734 | 10.76391148376898 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_s | Oslo S | by | data/places/by/oslo/places/oslo_s.json | 59.91087480164096 | 10.750736725832216 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vulkan_energisentral | Vulkan energisentral | by | data/places/by/oslo/places/vulkan_energisentral.json | 59.92225253860743 | 10.751749415749577 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gronland_kirke | Grønland kirke | by | data/places/by/oslo/places/gronland_kirke.json | 59.9110993638745 | 10.767560036280734 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kampen_kirke | Kampen kirke | by | data/places/by/oslo/places/kampen_kirke.json | 59.911907208292654 | 10.781606997031624 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_bussterminal | Oslo bussterminal | by | data/places/by/oslo/places/oslo_bussterminal.json | 59.911683292287975 | 10.758147862149471 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| deichman_bjorvika | Deichman Bjørvika | by | data/places/by/oslo/places/deichman_bjorvika.json | 59.90868907082338 | 10.75212918471088 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| voienvolden | Voienvolden | by | data/places/by/oslo/places/voienvolden.json | 59.93436330000289 | 10.75464137146488 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| saga_kino | Saga kino | naeringsliv | data/places/film/oslo/places/saga_kino.json | 59.914483496767964 | 10.73252179359581 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| klingenberg_kino | Klingenberg kino | sport | data/places/film/oslo/places/klingenberg_kino.json | 59.913419951009054 | 10.732806189784029 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gimle_kino | Gimle kino | naeringsliv | data/places/film/oslo/places/gimle_kino.json | 59.91723919101994 | 10.709250463305766 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vika_kino | Vika kino | by | data/places/film/oslo/places/vika_kino.json | 59.913498581158905 | 10.7284586944203 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gamle_aker_kirke | Gamle Aker kirke | historie | data/places/historie/oslo/places_historie/gamle_aker_kirke.json | 59.923779239528116 | 10.74681853984208 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| villa_grande | Villa Grande | historie | data/places/historie/oslo/places_historie/villa_grande.json | 59.89911019330011 | 10.678158888428362 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| mollergata_19 | Møllergata 19 | historie | data/places/historie/oslo/places_historie/mollergata_19.json | 59.91528413168428 | 10.747869191554551 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sagene_skole | Sagene skole | historie | data/places/historie/oslo/places_historie/sagene_skole.json | 59.93078969319966 | 10.75928429201007 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_domkirke | Oslo domkirke | by | data/places/by/oslo/oslo_domkirke/oslo_domkirke.json | 59.91266533589023 | 10.746431229351575 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gamle_trikkestallen | Gamle trikkestallen på Torshov | by | data/places/by/oslo/gamle_trikkestallen/gamle_trikkestallen.json | 59.93283549643305 | 10.768161829321377 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| slottet | Det kongelige slott | politikk | data/places/politikk/oslo/slottet/slottet.json | 59.917063045432855 | 10.727724636631736 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sofienberg_kirke | Sofienberg kirke | by | data/places/by/oslo/sofienberg_kirke/sofienberg_kirke.json | 59.922239531059745 | 10.765987821107696 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| trefoldighetskirken | Trefoldighetskirken | by | data/places/by/oslo/trefoldighetskirken/trefoldighetskirken.json | 59.91672903151453 | 10.744766562559661 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_ladegard | Oslo ladegård | historie | data/places/historie/oslo/places_historie_added_batch_01/oslo_ladegard.json | 59.906175969346684 | 10.767673829543098 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| botsfengselet | Botsfengselet | historie | data/places/historie/oslo/places_historie_added_batch_01/botsfengselet.json | 59.90971506327703 | 10.774997663433767 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| peststotten_krist_kirkegard | Peststøtten – Krist kirkegård | historie | data/places/historie/oslo/places_historie_added_batch_01/peststotten_krist_kirkegard.json | 59.917469 | 10.746586 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| villa_stenersen | Villa Stenersen | historie | data/places/historie/oslo/places_historie_added_batch_01/villa_stenersen.json | 59.939226276070805 | 10.698765324399833 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| st_hallvard_kirke_kloster | St. Hallvard kirke og kloster | historie | data/places/historie/oslo/places_historie_added_batch_01/st_hallvard_kirke_kloster.json | 59.91294052851478 | 10.769571694450226 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gamle_radhus | Gamle rådhus | by | data/places/by/oslo/gamle_radhus/gamle_radhus.json | 59.909847408217715 | 10.740149053425348 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| eidsvoll_verk_andelva | Eidsvoll Verk / Andelva | naeringsliv | data/places/naeringsliv/akershus/eidsvoll_verk_andelva/eidsvoll_verk_andelva.json | 60.30153 | 11.1709 | 360 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tertitten_urskog_holandsbanen | Tertitten / Urskog-Hølandsbanen | by | data/places/by/akershus/tertitten_urskog_holandsbanen/tertitten_urskog_holandsbanen.json | 59.98628 | 11.24367 | 260 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kjeller_flyplass | Kjeller flyplass | by | data/places/by/akershus/kjeller_flyplass/kjeller_flyplass.json | 59.96944 | 11.03889 | 360 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tanum_kirke | Tanum kirke | historie | data/places/historie/akershus/places_historie_akershus_batch2/tanum_kirke.json | 59.89562 | 10.47931 | 220 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| skedsmo_kirke | Skedsmo kirke | historie | data/places/historie/akershus/places_historie_akershus_batch2/skedsmo_kirke.json | 59.99381 | 11.04531 | 220 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sarpsfossen | Sarpefossen | natur | data/places/natur/ostfold/sarpsfossen/sarpsfossen.json | 59.27634 | 11.13123 | 360 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| proysenhuset_rudshogda | Prøysenhuset – Rudshøgda | litteratur | data/places/litteratur/innlandet/proysenhuset_rudshogda.json | 60.912182010287836 | 10.791215743205731 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nationaltheatret | Nationaltheatret | scenekunst | data/places/scenekunst/oslo/places_scenekunst/nationaltheatret.json | 59.91456789100917 | 10.733617256734934 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| det_norske_teatret | Det Norske Teatret | scenekunst | data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json | 59.91521126103172 | 10.738641190958791 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| chat_noir | Chat Noir | scenekunst | data/places/scenekunst/oslo/places_scenekunst/chat_noir.json | 59.91360791283421 | 10.732172099794877 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| edderkoppen_scene | Edderkoppen Scene | scenekunst | data/places/scenekunst/oslo/places_scenekunst/edderkoppen_scene.json | 59.91815941203321 | 10.739832936543767 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| latter | Latter | scenekunst | data/places/scenekunst/oslo/places_scenekunst/latter.json | 59.91081373400813 | 10.726768537822347 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| folketeateret | Folketeateret | scenekunst | data/places/scenekunst/oslo/places_scenekunst/folketeateret.json | 59.9145532904993 | 10.749678422671124 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| operahuset | Operahuset | scenekunst | data/places/scenekunst/oslo/places_scenekunst/operahuset.json | 59.90777660297918 | 10.752057851974856 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| black_box_teater | Black Box teater | scenekunst | data/places/scenekunst/oslo/places_scenekunst/black_box_teater.json | 59.92700508153591 | 10.768737228438797 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| dansens_hus_oslo | Dansens Hus | scenekunst | data/places/scenekunst/oslo/places_scenekunst/dansens_hus_oslo.json | 59.921391233585794 | 10.752559156734778 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| riksscenen | Riksscenen | scenekunst | data/places/scenekunst/oslo/places_scenekunst/riksscenen.json | 59.91871322894722 | 10.761703929151963 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_nye_teater_hovedscenen | Oslo Nye Teater – Hovedscenen | scenekunst | data/places/scenekunst/oslo/places_scenekunst/oslo_nye_teater_hovedscenen.json | 59.91444272072215 | 10.739709939907648 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| det_andre_teatret | Det Andre Teatret | scenekunst | data/places/scenekunst/oslo/places_scenekunst/det_andre_teatret.json | 59.93874688851995 | 10.765362071425985 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nordic_black_theatre_cafeteatret | Nordic Black Theatre / Cafeteatret | scenekunst | data/places/scenekunst/oslo/places_scenekunst/nordic_black_theatre_cafeteatret.json | 59.91036041991715 | 10.767073643250859 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| centralteatret | Centralteatret | scenekunst | data/places/scenekunst/oslo/places_scenekunst/centralteatret.json | 59.91458184873146 | 10.743455468460521 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| grusomhetens_teater | Grusomhetens Teater | scenekunst | data/places/scenekunst/oslo/places_scenekunst/grusomhetens_teater.json | 59.919148209457326 | 10.751977548509613 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| rommen_scene | Rommen Scene | scenekunst | data/places/scenekunst/oslo/places_scenekunst/rommen_scene.json | 59.96736733733063 | 10.914417596858193 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| salt_oslo | SALT | scenekunst | data/places/scenekunst/oslo/places_scenekunst/salt_oslo.json | 59.90760281927637 | 10.746880614147818 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| det_andre_teatret_intimscenen | Det Andre Teatret – Intimscenen | scenekunst | data/places/scenekunst/oslo/places_scenekunst/det_andre_teatret_intimscenen.json | 59.93829179264618 | 10.765140986301802 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nasjonalmuseet | Nasjonalmuseet | kunst | data/places/kunst/oslo/places_kunst/nasjonalmuseet.json | 59.91149437954434 | 10.729109219868187 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| astrup_fearnley | Astrup Fearnley Museet | kunst | data/places/kunst/oslo/places_kunst/astrup_fearnley.json | 59.90679078788014 | 10.721563360663236 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nasjonalbiblioteket | Nasjonalbiblioteket | litteratur | data/places/litteratur/oslo/places_litteratur/nasjonalbiblioteket.json | 59.91429565254146 | 10.717362462417718 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| grotta | Grotten | litteratur | data/places/litteratur/oslo/places_litteratur/grotta.json | 59.918721365539604 | 10.731257963441367 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| litteraturhuset | Litteraturhuset | litteratur | data/places/litteratur/oslo/places_litteratur/litteraturhuset.json | 59.92027454485075 | 10.728566026476651 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tronsmo_bokhandel | Tronsmo Bokhandel | litteratur | data/places/litteratur/oslo/places_litteratur/tronsmo_bokhandel.json | 59.916504851005804 | 10.738621210337177 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| eldorado_bokhandel | Eldorado Bokhandel | litteratur | data/places/litteratur/oslo/places_litteratur/eldorado_bokhandel.json | 59.91394802646695 | 10.747911617247832 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gamle_deichman | Gamle Deichman | litteratur | data/places/litteratur/oslo/places_litteratur/gamle_deichman.json | 59.91655515223004 | 10.74636730347388 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| deichman_grunerlokka | Deichman Grünerløkka | litteratur | data/places/litteratur/oslo/places_litteratur/deichman_grunerlokka.json | 59.920789784433865 | 10.760221823170998 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kulturkirken_jakob_litteratur | Kulturkirken Jakob | litteratur | data/places/litteratur/oslo/places_litteratur/kulturkirken_jakob_litteratur.json | 59.9180329772343 | 10.754119014784367 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ruth_maier_minne | Ruth Maier-minnesmerke | litteratur | data/places/litteratur/oslo/places_litteratur/ruth_maier_minne.json | 59.922730001268235 | 10.737930723902437 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| inger_hagerups_plass | Inger Hagerups plass | litteratur | data/places/litteratur/oslo/places_litteratur/inger_hagerups_plass.json | 59.9221744 | 10.853756 | 130 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vg_huset | VG-huset | media | data/places/media/oslo/places_oslo_media/vg_huset.json | 59.91512243824226 | 10.743666267309775 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nrk_huset_marienlyst | NRK-huset på Marienlyst | media | data/places/media/oslo/places_oslo_media/nrk_huset_marienlyst.json | 59.934722555717045 | 10.719662425687908 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| klassekampen_redaksjon | Klassekampen-redaksjonen | media | data/places/media/oslo/places_oslo_media/klassekampen_redaksjon.json | 59.91335273517942 | 10.759577592129606 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| rockefeller | Rockefeller Music Hall | musikk | data/places/musikk/oslo/places_musikk/rockefeller.json | 59.916235041685646 | 10.750323246840185 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| john_dee | John Dee | musikk | data/places/musikk/oslo/places_musikk/john_dee.json | 59.916145361023055 | 10.750313157984397 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sentrum_scene | Sentrum Scene | musikk | data/places/musikk/oslo/places_musikk/sentrum_scene.json | 59.91552200049789 | 10.751804295846025 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| havnelageret | Oslo Havnelager | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/havnelageret.json | 59.90760281927637 | 10.746880614147818 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_posthus | Oslo Posthus | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/oslo_posthus.json | 59.91038965689687 | 10.746007652609869 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vinmonopolet_lager | Vinmonopolets hovedlager | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/vinmonopolet_lager.json | 59.926820467284585 | 10.793178356826628 | 160 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| jernbaneverkstedet_lodalen | Lodalen jernbaneverksted | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/jernbaneverkstedet_lodalen.json | 59.90436199249329 | 10.774336415114837 | 200 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/grunnlovsbygget_bankplassen.json | 59.908727042084166 | 10.74038191009086 | 25 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ulven_handelspark | Construction City | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/ulven_handelspark.json | 59.924017628728656 | 10.81017987877654 | 160 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| schous_bryggeri | Schous bryggeri | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/schous_bryggeri.json | 59.91871322894722 | 10.761703929151963 | 160 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ringnes_bryggeri | Ringnes bryggeri | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/ringnes_bryggeri.json | 59.930179384813485 | 10.759251969442406 | 160 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_kraftselskap | Oslo Lysverkers hovedkontor | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/oslo_kraftselskap.json | 59.915245305085435 | 10.719611579321567 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vippetangen_fisketorg | Fiskehallen på Vippetangen | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/vippetangen_fisketorg.json | 59.90297426597389 | 10.740325792625368 | 100 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| christiania_seildugsfabrik | Christiania Seildugsfabrik | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/christiania_seildugsfabrik.json | 59.9253444010033 | 10.75475549771365 | 180 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| lilleborg_fabrikker | Lilleborg Fabrikker | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/lilleborg_fabrikker.json | 59.93729471693473 | 10.765821835434187 | 140 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| glads_molle | Glads mølle | historie | data/places/natur/oslo/places_oslo_natur_akerselvarute/glads_molle.json | 59.931850362845985 | 10.757873019733754 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| voien_gard_voienvolden | Vøienvolden gård | historie | data/places/natur/oslo/places_oslo_natur_akerselvarute/voien_gard_voienvolden.json | 59.93436330000289 | 10.75464137146488 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vulkan_industriomrade | Vulkan industriområde | by | data/places/natur/oslo/places_oslo_natur_akerselvarute/vulkan_industriomrade.json | 59.922646873289004 | 10.751204856903922 | 180 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| stortinget | Stortinget | politikk | data/places/politikk/oslo/places_politikk/stortinget.json | 59.91321312337565 | 10.74032524097933 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_radhus | Oslo rådhus | politikk | data/places/politikk/oslo/places_politikk/oslo_radhus.json | 59.91174989125625 | 10.733452414128745 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tinghuset | Oslo tinghus | politikk | data/places/politikk/oslo/places_politikk/tinghuset.json | 59.915618872260445 | 10.741442136536953 | 30 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| hoyesteretts_hus | Høyesteretts hus | politikk | data/places/politikk/oslo/places_politikk/hoyesteretts_hus.json | 59.914567897676186 | 10.744510031498768 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| politihuset_gronland | Politihuset på Grønland | politikk | data/places/politikk/oslo/places_politikk/politihuset_gronland.json | 59.91076260893923 | 10.770099603960052 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| folkets_hus_oslo | Folkets Hus i Oslo | politikk | data/places/politikk/oslo/places_politikk/folkets_hus_oslo.json | 59.9148900622556 | 10.750628039496302 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| 22_juli_senteret | 22. juli-senteret | politikk | data/places/politikk/oslo/places_politikk/22_juli_senteret.json | 59.91524358534389 | 10.744760134934927 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| victoria_terrasse | Victoria terrasse | politikk | data/places/politikk/oslo/places_politikk/victoria_terrasse.json | 59.91477868971177 | 10.729192422176304 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| statsministerboligen | Statsministerboligen | politikk | data/places/politikk/oslo/places_politikk/statsministerboligen.json | 59.91808030407976 | 10.722602475302931 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| hoyres_hus | Høyres Hus | politikk | data/places/politikk/oslo/places_politikk/hoyres_hus.json | 59.913769172155234 | 10.73493492745129 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kfum_arena | KFUM Arena | sport | data/places/sport/europa/norway/oslo_sport/kfum_arena.json | 59.88862965039414 | 10.782076254654621 | 160 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nordre_aasen_idrettspark | Nordre Åsen idrettspark | sport | data/places/sport/europa/norway/oslo_sport/nordre_aasen_idrettspark.json | 59.94276845982983 | 10.784873923983723 | 170 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| hausmania | Hausmania | subkultur | data/places/subkultur/oslo/places_subkultur/hausmania.json | 59.919148209457326 | 10.751977548509613 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| skur13 | Skur 13 | subkultur | data/places/subkultur/oslo/places_subkultur/skur13.json | 59.909652031188216 | 10.72082449208237 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| torggata_blad | Torggata Blad | subkultur | data/places/subkultur/oslo/places_subkultur/torggata_blad.json | 59.91657334372696 | 10.75561428991178 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| blitzhuset | Blitzhuset | subkultur | data/places/subkultur/oslo/places_subkultur/blitzhuset.json | 59.91840193086 | 10.73778846737114 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kafe_haerverk | Kafé Hærverk | subkultur | data/places/subkultur/oslo/places_subkultur/kafe_haerverk.json | 59.919148209457326 | 10.751977548509613 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gamlebyen_sport_og_fritid | Gamlebyen Sport og Fritid | subkultur | data/places/subkultur/oslo/places_subkultur/gamlebyen_sport_og_fritid.json | 59.905411273181684 | 10.768437847106954 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_skatehall | Oslo Skatehall | subkultur | data/places/subkultur/oslo/places_subkultur/oslo_skatehall.json | 59.94192173205158 | 10.752505988709485 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| xray_ungdomskulturhus | X-Ray Ungdomskulturhus | subkultur | data/places/subkultur/oslo/places_subkultur/xray_ungdomskulturhus.json | 59.92065765555904 | 10.751597362221323 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vaterland_bar_scene | Vaterland Bar & Scene | subkultur | data/places/subkultur/oslo/places_subkultur/vaterland_bar_scene.json | 59.91391103248318 | 10.756101476822108 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| last_train_oslo | Last Train | subkultur | data/places/subkultur/oslo/places_subkultur/last_train_oslo.json | 59.91457300863339 | 10.73664031059204 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| rock_in_oslo | Rock In | subkultur | data/places/subkultur/oslo/places_subkultur/rock_in_oslo.json | 59.91312888495517 | 10.760871395801564 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| revolver_oslo | Revolver | musikk | data/places/subkultur/oslo/places_subkultur/revolver_oslo.json | 59.91699988365845 | 10.749742822662785 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| the_villa | The Villa | musikk | data/places/subkultur/oslo/places_subkultur/the_villa.json | 59.91563512459411 | 10.74856019808857 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| jaeger_oslo | Jaeger | musikk | data/places/subkultur/oslo/places_subkultur/jaeger_oslo.json | 59.913899495519225 | 10.743437565163234 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sub_scene | Sub Scene | subkultur | data/places/subkultur/oslo/places_subkultur/sub_scene.json | 59.912177321780405 | 10.736461501289167 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| mir_grunerlokka_lufthavn | MIR / Grünerløkka Lufthavn | subkultur | data/places/subkultur/oslo/places_subkultur/mir_grunerlokka_lufthavn.json | 59.92154264383429 | 10.761013090288696 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| prindsen_mottakssenter | Prindsen mottakssenter | subkultur | data/places/subkultur/oslo/places_subkultur/prindsen_mottakssenter.json | 59.91573563125075 | 10.756875795973647 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| fyrlyset_oslo | Fyrlyset | subkultur | data/places/subkultur/oslo/places_subkultur/fyrlyset_oslo.json | 59.91519741735937 | 10.76402173101248 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| evangeliesenteret_kontaktsenter_oslo | Evangeliesenterets kontaktsenter | subkultur | data/places/subkultur/oslo/places_subkultur/evangeliesenteret_kontaktsenter_oslo.json | 59.91558667149652 | 10.755045241412303 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| brugata_storgata_rusmiljo | Brugata / Storgata – det åpne rusmiljøet | subkultur | data/places/subkultur/oslo/places_subkultur/brugata_storgata_rusmiljo.json | 59.9146165881438 | 10.753026513871012 | 100 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| huset_oslo | Huset Oslo | subkultur | data/places/subkultur/oslo/places_subkultur/huset_oslo.json | 59.923969075170824 | 10.726541485081306 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nadheim_oslo | Nadheim | subkultur | data/places/subkultur/oslo/places_subkultur/nadheim_oslo.json | 59.91270580984919 | 10.765642283295504 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| motestedet_tollbugata | Møtestedet – Tollbugata | subkultur | data/places/subkultur/oslo/places_subkultur/motestedet_tollbugata.json | 59.90976205545865 | 10.747280208188046 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| universitetets_gamle_hovedbygning | Universitetets gamle hovedbygning | vitenskap | data/places/vitenskap/oslo/places_vitenskap/universitetets_gamle_hovedbygning.json | 59.91535567609494 | 10.735178716853644 | 160 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | vitenskap | data/places/vitenskap/oslo/places_vitenskap/universitetets_gamle_kjemi.json | 59.917023156193885 | 10.73472914137377 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tvergastein | Tvergastein | vitenskap | data/places/vitenskap/oslo/places_vitenskap/tvergastein.json | 60.54919 | 7.9797 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gamlebyen_skole | Gamlebyen skole | vitenskap | data/places/vitenskap/oslo/places_vitenskap/gamlebyen_skole.json | 59.90681241 | 10.77044366 | 150 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| universitetet_i_oslo_blindern | Universitetet i Oslo, Blindern | vitenskap | data/places/vitenskap/oslo/places_vitenskap/universitetet_i_oslo_blindern.json | 59.94013280617488 | 10.720291655207404 | 920 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| naturhistorisk_museum | Naturhistorisk museum | vitenskap | data/places/vitenskap/oslo/places_vitenskap/naturhistorisk_museum.json | 59.92013360357791 | 10.770992295176185 | 170 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| teknisk_museum | Norsk Teknisk Museum | vitenskap | data/places/vitenskap/oslo/places_vitenskap/teknisk_museum.json | 59.96642806414705 | 10.78270731715194 | 170 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| rikshospitalet | Rikshospitalet | vitenskap | data/places/vitenskap/oslo/places_vitenskap/rikshospitalet.json | 59.948348176394674 | 10.714348787763203 | 620 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| radiumhospitalet | Radiumhospitalet | vitenskap | data/places/vitenskap/oslo/places_vitenskap/radiumhospitalet.json | 59.92992084947542 | 10.660609376970168 | 340 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| meteorologisk_institutt | Meteorologisk institutt | vitenskap | data/places/vitenskap/oslo/places_vitenskap/meteorologisk_institutt.json | 59.94270614863892 | 10.720621900236225 | 150 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_met_pilestredet | OsloMet, Pilestredet | vitenskap | data/places/vitenskap/oslo/places_vitenskap/oslo_met_pilestredet.json | 59.92110512950236 | 10.733028013329037 | 270 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| arkitektur_og_designhogskolen | Arkitektur- og designhøgskolen i Oslo | vitenskap | data/places/vitenskap/oslo/places_vitenskap/arkitektur_og_designhogskolen.json | 59.92481402 | 10.75073759 | 160 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bi_nydalen | BI i Nydalen | vitenskap | data/places/vitenskap/oslo/places_vitenskap/bi_nydalen.json | 59.94887042 | 10.76820661 | 180 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nobelinstituttet | Nobelinstituttet | vitenskap | data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner/nobelinstituttet.json | 59.91543154930346 | 10.721857053164658 | 150 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| observatoriet | Observatoriet | vitenskap | data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner/observatoriet.json | 59.91294143279193 | 10.717900602014737 | 160 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| psykologisk_institutt_uio | Psykologisk institutt, UiO | psykologi | data/places/psykologi/oslo/places_psykologi/psykologisk_institutt_uio.json | 59.94377072400817 | 10.713355170321078 | 110 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| stodle_kyrkje | Stødle kyrkje | historie | data/places/historie/vestland/etne/stodle_kyrkje.json | 59.67308435910557 | 5.965736600116007 | 220 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| saebotunet_etne | Sæbøtunet | historie | data/places/historie/vestland/etne/saebotunet_etne.json | 59.662189 | 5.9286364 | 180 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gjerde_kyrkje_etne | Gjerde kyrkje | historie | data/places/historie/vestland/etne/gjerde_kyrkje_etne.json | 59.66405094671738 | 5.9347257675064755 | 180 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| grindheim_kyrkje_etne | Grindheim kyrkje | historie | data/places/historie/vestland/etne/grindheim_kyrkje_etne.json | 59.669831859699535 | 6.0040452933118456 | 180 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| skanevik_gjestgjevargarden | Skånevik Gjestgjevargard | historie | data/places/historie/vestland/etne/skanevik_gjestgjevargarden.json | 59.73128737155455 | 5.92525891571817 | 180 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| reichwald_snublesteiner_skanevik | Reichwald-snublesteinene | historie | data/places/historie/vestland/etne/reichwald_snublesteiner_skanevik.json | 59.733018516381904 | 5.934691072324555 | 140 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| etne_prestebustad | Etne prestebustad | historie | data/places/historie/vestland/etne/etne_prestebustad.json | 59.671099414861274 | 5.957246993001724 | 220 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| fjaera_kapell | Fjæra kapell | historie | data/places/historie/vestland/etne/fjaera_kapell.json | 59.87535812729994 | 6.38802246531671 | 180 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| etne_tinghus | Etne Tinghus | politikk | data/places/politikk/vestland/etne/etne_tinghus.json | 59.66489494369154 | 5.934465720587056 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| etne_brannstasjon | Etne brannstasjon | politikk | data/places/politikk/vestland/etne/etne_brannstasjon.json | 59.668576636879024 | 5.943861929172312 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| skanevik_brannstasjon | Skånevik brannstasjon | politikk | data/places/politikk/vestland/etne/skanevik_brannstasjon.json | 59.72875 | 5.93592 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| grannar_redaksjon_etne | Grannar-redaksjonen i Etne | media | data/places/media/vestland/etne/grannar_redaksjon_etne/grannar_redaksjon_etne.json | 59.66414439895677 | 5.940649457868514 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| psykisk_helse_rus_etne | Psykisk helse og rus – Etne | psykologi | data/places/psykologi/vestland/etne/psykisk_helse_rus_etne/psykisk_helse_rus_etne.json | 59.66534125070043 | 5.943034081601908 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| psykisk_helse_rus_skanevik | Psykisk helse og rus – Skånevik | psykologi | data/places/psykologi/vestland/etne/psykisk_helse_rus_skanevik/psykisk_helse_rus_skanevik.json | 59.73234389428389 | 5.935277893100119 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| frammuseet | Frammuseet | historie | data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05/frammuseet.json | 59.90320332524704 | 10.699091907892317 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kon_tiki_museet | Kon-Tiki Museet | historie | data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05/kon_tiki_museet.json | 59.90342401326082 | 10.698275332643746 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nordisk_bibelmuseum | Nordisk Bibelmuseum | historie | data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06/nordisk_bibelmuseum.json | 59.910279645957665 | 10.740947844594505 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| flop_museum | FLOP Museum | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_atlas_obscura_flop_batch_07/flop_museum.json | 59.908255036287656 | 10.761378655427743 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| folkeobservatoriet_holmenkollen | Folkeobservatoriet | vitenskap | data/places/vitenskap/oslo/places_vitenskap_oslo_kultureiendommer_batch_01/folkeobservatoriet_holmenkollen.json | 59.9605731651147 | 10.666638892994078 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kjeglebanen_langgaardslokken | Kjeglebanen på Langgaardsløkken | sport | data/places/sport/europa/norway/places_oslo_kultureiendommer_batch_01/kjeglebanen_langgaardslokken.json | 59.92335742553447 | 10.7148429989095 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| radmannsgarden_og_anatomibygget | Rådmannsgården og Anatomibygget | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_02/radmannsgarden_og_anatomibygget.json | 59.91014146776003 | 10.740325400685213 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| magistratgarden | Magistratgården | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_02/magistratgarden.json | 59.9092795875744 | 10.745055179458067 | 65 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| hauges_minde | Hauges Minde | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03/hauges_minde.json | 59.92228111752553 | 10.75817184314198 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| slurpen_lakkegata | Slurpen | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03/slurpen_lakkegata.json | 59.91931038465871 | 10.768086181233059 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| geitmyra_gard | Geitmyra gård | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04/geitmyra_gard.json | 59.93719464243419 | 10.744320304993959 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gronland_politistasjon | Grønland politistasjon | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_04/gronland_politistasjon.json | 59.91310411421603 | 10.76346350302876 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| toyen_trafo | Tøyen trafo | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04/toyen_trafo.json | 59.91708427752621 | 10.780668130159562 | 65 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| honse_lovisas_hus | Hønse-Lovisas hus | litteratur | data/places/litteratur/oslo/places_litteratur_oslo_kultureiendommer_batch_05/honse_lovisas_hus.json | 59.930837365102796 | 10.757729935954078 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sagene_festivitetshus | Sagene festivitetshus | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_05/sagene_festivitetshus.json | 59.93137049982586 | 10.760854064462801 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| etterstadgata_6 | Etterstadgata 6 | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_05/etterstadgata_6.json | 59.90931822852265 | 10.791715634518276 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| villa_furulund | Villa Furulund | kunst | data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_05/villa_furulund.json | 59.92642309728162 | 10.780148742091422 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| villa_romsli | Villa Romsli | kunst | data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_06/villa_romsli.json | 59.96617126839898 | 10.899604528514946 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| stubljan_paviljongen_hvervenbukta | Stubljan-paviljongen i Hvervenbukta | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_07/stubljan_paviljongen_hvervenbukta.json | 59.83391028057809 | 10.772352984625687 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| trosterudvillaen | Trosterudvillaen | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_08/trosterudvillaen.json | 59.92348778601233 | 10.866602631958953 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sporveismuseet | Sporveismuseet | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/sporveismuseet.json | 59.931307601915144 | 10.71602648075083 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| saxegarden | Saxegården | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/saxegarden.json | 59.90362585545991 | 10.764945589472955 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ovre_fossum_gard | Øvre Fossum gård | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/ovre_fossum_gard.json | 59.95916207908544 | 10.927090991752289 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| lambertseter_gard | Lambertseter gård | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/lambertseter_gard.json | 59.8736713675549 | 10.814339406372168 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nordre_skoyen_hovedgard | Nordre Skøyen hovedgård | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/nordre_skoyen_hovedgard.json | 59.90761519680599 | 10.827573908322991 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| lokomotivverkstedet | Lokomotivverkstedet | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/lokomotivverkstedet.json | 59.90431860322039 | 10.763516120997933 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tveten_gard | Tveten gård | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/tveten_gard.json | 59.913061375377836 | 10.836900380109173 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| frysja_33_brekke_kraftstasjon | Frysja 33 – Brekke kraftstasjon | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_13/frysja_33_brekke_kraftstasjon.json | 59.96652761473437 | 10.776657553367157 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| steen_og_strom | Steen & Strøm | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/steen_og_strom.json | 59.911562042330516 | 10.743066380237748 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| centralbanken_kirkegata | Centralbanken | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/centralbanken_kirkegata.json | 59.910183744652514 | 10.743922294639356 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kafe_grei | Kafé Grei | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/kafe_grei.json | 59.907942752705715 | 10.744949249406519 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| borsen_oslo | Oslo Børs | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/borsen_oslo.json | 59.90904377343142 | 10.747939911610652 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| treschowgarden | Treschowgården | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/treschowgarden.json | 59.9096247918653 | 10.74814929599479 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kirkeristen_basarene_brannvakten | Kirkeristen, Basarene og Brannvakten | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01/kirkeristen_basarene_brannvakten.json | 59.912189597800115 | 10.747765502740915 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| den_gamle_krigsskolen | Den gamle Krigsskolen | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01/den_gamle_krigsskolen.json | 59.909991452797726 | 10.745557526064319 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| hotel_du_nord | Hotel du Nord | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02/hotel_du_nord.json | 59.90947510065043 | 10.745280045026805 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| cafe_engebret | Café Engebret | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_02/cafe_engebret.json | 59.9089234456751 | 10.742103623159887 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| garmanngarden | Garmanngården | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/garmanngarden.json | 59.90905001695339 | 10.744756995654964 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| stattholdergarden | Stattholdergården | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/stattholdergarden.json | 59.909372909195 | 10.74343267394393 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| waisenhuset_kongens_gate | Waisenhuset | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/waisenhuset_kongens_gate.json | 59.90908688101301 | 10.740609982142896 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| myntgatakvartalet | Myntgatakvartalet | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_02/myntgatakvartalet.json | 59.9090899572128 | 10.738471290497495 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| amerikalinjen | Amerikalinjen | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03/amerikalinjen.json | 59.91076457251223 | 10.749568439161244 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| dfds_bygget | DFDS-bygget | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03/dfds_bygget.json | 59.91137749505985 | 10.749403964838672 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| norges_bank_bankplassen_4 | Norges Bank – Bankplassen 4 | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04/norges_bank_bankplassen_4.json | 59.90866481462448 | 10.741285328997623 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| mustadgarden_kongens_gate_3 | Mustadgården – Kongens gate 3 | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_art_sites_batch_01/mustadgarden_kongens_gate_3.json | 59.90925646800815 | 10.740826309073695 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| avisen_tiden_radhusgata_10 | Avisen Tiden – Rådhusgata 10 | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_hovedstaden_batch_01/avisen_tiden_radhusgata_10.json | 59.909004916311204 | 10.744092944484954 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sjofartsbygningen | Sjøfartsbygningen | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_hovedstaden_batch_01/sjofartsbygningen.json | 59.90991497265444 | 10.741833670297687 | 75 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| schiollgarden_prinsens_gate_26 | Schiøllgården | by | data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_hovedstaden_batch_02/schiollgarden_prinsens_gate_26.json | 59.91224425845788 | 10.739559115511142 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| norges_bank_bankplassen_2 | Norges Bank – Bankplassen 2 | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_under_bakken_batch_01/norges_bank_bankplassen_2.json | 59.90862371981983 | 10.742356165353511 | 90 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kirkegata_5 | Kirkegata 5 | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_stil_arkitektur_batch_01/kirkegata_5.json | 59.90929426367078 | 10.742588024864189 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_stein_mehren_ullevalsveien_60 | Blått skilt: Stein Mehren | litteratur | data/places/litteratur/oslo/places_litteratur_oslo_bla_skilt_2026_batch_01/bla_skilt_stein_mehren_ullevalsveien_60.json | 59.9302631186139 | 10.7366731375306 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5 | Blått skilt: Christopher Hornsrud | politikk | data/places/politikk/oslo/places_politikk_oslo_bla_skilt_2026_batch_01/bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5.json | 59.91573336836374 | 10.711784503719619 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_helverschous_lokke_munkedamsveien_35 | Blått skilt: Helverschous løkke | historie | data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01/bla_skilt_helverschous_lokke_munkedamsveien_35.json | 59.911785794838465 | 10.7259247905869 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_enerhaugen_samfund_smedgata_34 | Blått skilt: Enerhaugens Samfund | historie | data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01/bla_skilt_enerhaugen_samfund_smedgata_34.json | 59.91369333254918 | 10.77036298230481 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| norsk_folkemuseum | Norsk Folkemuseum | historie | data/places/historie/oslo/places_historie/norsk_folkemuseum.json | 59.90748291814004 | 10.686716088479649 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| norsk_maritimt_museum | Norsk Maritimt Museum | historie | data/places/historie/oslo/places_historie/norsk_maritimt_museum.json | 59.90287004478952 | 10.698052152795242 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| historisk_museum | Historisk museum | historie | data/places/historie/oslo/places_historie/historisk_museum.json | 59.916807785575195 | 10.735397626110528 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| frogner_hovedgard | Frogner hovedgård | historie | data/places/historie/oslo/places_historie/frogner_hovedgard.json | 59.92395135932375 | 10.703042174281878 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| arbeidermuseet | Arbeidermuseet | historie | data/places/historie/oslo/places_historie/arbeidermuseet.json | 59.93093537120987 | 10.755766647060659 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nobels_fredssenter | Nobels Fredssenter | historie | data/places/historie/oslo/places_historie/nobels_fredssenter.json | 59.911609366245315 | 10.730476225834142 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kunstnernes_hus | Kunstnernes Hus | kunst | data/places/kunst/oslo/places_kunst/kunstnernes_hus.json | 59.91943035555868 | 10.730615118964748 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vigelandmuseet | Vigelandmuseet | kunst | data/places/kunst/oslo/places_kunst/vigelandmuseet.json | 59.92281343368528 | 10.700466646968607 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| mollergata_skole | Møllergata skole | historie | data/places/historie/oslo/places_historie/mollergata_skole.json | 59.918190097882 | 10.750406532588284 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tbs_gallery | TBS Gallery | kunst | data/places/kunst/oslo/places_kunst/tbs_gallery.json | 59.922142741324926 | 10.725818640861803 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| viking_planet_oslo | The Viking Planet Oslo | historie | data/places/historie/oslo/places_historie/viking_planet_oslo.json | 59.91321454837157 | 10.734083243973915 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| the_salmon_vitensenter | The Salmon – kunnskapssenter | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/the_salmon_vitensenter.json | 59.90793198330203 | 10.723239043633493 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| jodisk_museum_oslo | Jødisk Museum i Oslo | historie | data/places/historie/oslo/places_historie/jodisk_museum_oslo.json | 59.916392056400085 | 10.755266642495423 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| det_internasjonale_barnekunstmuseet | Det internasjonale Barnekunstmuseet | kunst | data/places/kunst/oslo/places_kunst/det_internasjonale_barnekunstmuseet.json | 59.93569216008246 | 10.71161396805781 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ibsen_museum_teater | IBSEN Museum & Teater | litteratur | data/places/litteratur/oslo/places_litteratur/ibsen_museum_teater.json | 59.91515703089785 | 10.726845708120743 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_reptilpark | Oslo Reptilpark | vitenskap | data/places/vitenskap/oslo/places_vitenskap/oslo_reptilpark.json | 59.918158949801764 | 10.74326746089802 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| toyenbadet | Tøyenbadet | sport | data/places/sport/europa/norway/oslo_sport/toyenbadet.json | 59.91964580615434 | 10.778472621824964 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ekt_rideskole_husdyrpark | EKT Rideskole og Husdyrpark | sport | data/places/sport/europa/norway/oslo_sport/ekt_rideskole_husdyrpark.json | 59.89214335591169 | 10.774614195820838 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| dronning_sonja_kunststall | Dronning Sonja KunstStall | kunst | data/places/kunst/oslo/places_kunst/dronning_sonja_kunststall.json | 59.91623159845106 | 10.722971727795889 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| holmlia_bad | Holmlia bad | sport | data/places/sport/europa/norway/oslo_sport/holmlia_bad.json | 59.83446506552478 | 10.792402928876081 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| fagerborg_kirke | Fagerborg kirke | by | data/places/by/oslo/places/fagerborg_kirke.json | 59.92731169646222 | 10.72957630637256 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| uranienborg_kirke | Uranienborg kirke | by | data/places/by/oslo/places/uranienborg_kirke.json | 59.92124432218085 | 10.719653654620455 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| frogner_kirke | Frogner kirke | by | data/places/by/oslo/places/frogner_kirke.json | 59.91765709217892 | 10.70680343212464 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| skimore_oslo | Skimore Oslo | sport | data/places/sport/europa/norway/oslo_sport/skimore_oslo.json | 59.9853421444898 | 10.666588254871384 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| brannmuseet_oslo | Brannmuseet i Oslo | historie | data/places/historie/oslo/places_historie/brannmuseet_oslo.json | 59.91161909184595 | 10.766979584523039 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| skoytemuseet | Skøytemuseet | sport | data/places/sport/europa/norway/oslo_sport/skoytemuseet.json | 59.92758067916017 | 10.70956955882363 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kampen_okologiske_barnebondegard | Kampen Økologiske Barnebondegård | by | data/places/by/oslo/places/kampen_okologiske_barnebondegard.json | 59.91319830613384 | 10.785092383475156 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| klimahuset | Klimahuset | vitenskap | data/places/vitenskap/oslo/places_vitenskap/klimahuset.json | 59.919394833984754 | 10.772833068414897 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| fotografiens_hus | Fotografiens Hus | kunst | data/places/kunst/oslo/places_kunst/fotografiens_hus.json | 59.90951628354778 | 10.74209892031479 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| christian_radich | Christian Radich | historie | data/places/historie/oslo/places_historie/christian_radich.json | 59.90805979135746 | 10.733834060566368 | 100 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| central_jam_e_mosque | Central Jam-e-Mosque | historie | data/places/historie/oslo/places_historie/central_jam_e_mosque.json | 59.91054574923662 | 10.77400472380195 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| toyen_hovedgard | Tøyen hovedgård | historie | data/places/historie/oslo/places_historie/toyen_hovedgard.json | 59.917956019816764 | 10.770625820146192 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| museumsleiligheten_grabein | Museumsleiligheten Gråbein | historie | data/places/historie/oslo/places_historie/museumsleiligheten_grabein.json | 59.9149775365696 | 10.769036218785557 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| frigo_friluftssenteret | FRIGO – Friluftssenteret i Gamle Oslo | sport | data/places/sport/europa/norway/oslo_sport/frigo_friluftssenteret.json | 59.913567553035776 | 10.78965526234183 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| galleri_map | Galleri MAP | kunst | data/places/kunst/oslo/places_kunst/galleri_map.json | 59.914355410309014 | 10.767876268395765 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vi_vii_gallery | VI, VII | kunst | data/places/kunst/oslo/places_kunst/vi_vii_gallery.json | 59.91215712574447 | 10.742755978420295 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| the_oslo_gallery | The Oslo Gallery | kunst | data/places/kunst/oslo/places_kunst/the_oslo_gallery.json | 59.924682238617315 | 10.730101423555459 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| valerenga_kirke | Vålerenga kirke | historie | data/places/historie/oslo/places_historie/valerenga_kirke.json | 59.906858612988856 | 10.788310607669317 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kunsthall_oslo | Kunsthall Oslo | kunst | data/places/kunst/oslo/places_kunst/kunsthall_oslo.json | 59.91113787529822 | 10.778385870870046 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| biblo_toyen | Biblo Tøyen | litteratur | data/places/litteratur/oslo/places_litteratur/biblo_toyen.json | 59.914420834487764 | 10.775438542801346 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ekebergparken_museum | Ekebergparken Museum | historie | data/places/historie/oslo/places_historie/ekebergparken_museum.json | 59.89854101481173 | 10.75966997323581 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kosk_oslo | KÖSK | kunst | data/places/kunst/oslo/places_kunst/kosk_oslo.json | 59.90679399014945 | 10.758198688033378 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| galleri_mini_oslo | Galleri Mini | kunst | data/places/kunst/oslo/places_kunst/galleri_mini_oslo.json | 59.90820098960685 | 10.768031854087935 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| van_etten | Van Etten | kunst | data/places/kunst/oslo/places_kunst/van_etten.json | 59.91208993336192 | 10.769374391768624 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_prosjektrom | Oslo Prosjektrom | kunst | data/places/kunst/oslo/places_kunst/oslo_prosjektrom.json | 59.91112080426534 | 10.76528983153175 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| paulus_kirke | Paulus kirke | historie | data/places/historie/oslo/places_historie/paulus_kirke.json | 59.9263530529718 | 10.757922110312622 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| purenkel_galleri | Purenkel galleri | kunst | data/places/kunst/oslo/places_kunst/purenkel_galleri.json | 59.92336853758384 | 10.75610033410851 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oscarshall | Oscarshall | historie | data/places/historie/oslo/places_historie/oscarshall.json | 59.91026364422076 | 10.69231350671801 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vikingtidsmuseet | Vikingtidsmuseet | historie | data/places/historie/oslo/places_historie/vikingtidsmuseet.json | 59.9045924976552 | 10.684908358141946 | 75 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sukkerbiten_badstulandsby | Sukkerbiten badstulandsby | by | data/places/by/oslo/places/sukkerbiten_badstulandsby.json | 59.90511544518361 | 10.752999453009872 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| friluftshuset_sorenga | Friluftshuset på Sørenga | sport | data/places/sport/europa/norway/oslo_sport/friluftshuset_sorenga.json | 59.901351775655876 | 10.752423812422574 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| holmenkollen_kapell | Holmenkollen kapell | by | data/places/by/oslo/places/holmenkollen_kapell.json | 59.96566486446608 | 10.672227570089706 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oslo_golfklubb_bogstad | Oslo Golfklubb – Bogstad | sport | data/places/sport/europa/norway/oslo_sport/oslo_golfklubb_bogstad.json | 59.962399448254494 | 10.63892806989306 | 90 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| holmenkollen_skimuseum | Skimuseet i Holmenkollen | historie | data/places/historie/oslo/places_historie/holmenkollen_skimuseum.json | 59.96263248232449 | 10.666289172703161 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| den_nationale_scene | Den Nationale Scene | scenekunst | data/places/scenekunst/vestland/den_nationale_scene/den_nationale_scene.json | 60.39247577620086 | 5.320039546327612 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| rogaland_teater | Rogaland Teater | scenekunst | data/places/scenekunst/rogaland/rogaland_teater/rogaland_teater.json | 58.96551078762068 | 5.732785572923291 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| trondelag_teater | Trøndelag Teater | scenekunst | data/places/scenekunst/trondelag/trondelag_teater/trondelag_teater.json | 63.42934586047706 | 10.392085287246422 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| halogaland_teater | Hålogaland Teater | scenekunst | data/places/scenekunst/troms/halogaland_teater/halogaland_teater.json | 69.64220669937214 | 18.944678124887044 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| teater_ibsen | Teater Ibsen | scenekunst | data/places/scenekunst/telemark/teater_ibsen/teater_ibsen.json | 59.19811316291937 | 9.61481950506681 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nordland_teater | Nordland Teater | scenekunst | data/places/scenekunst/nordland/nordland_teater/nordland_teater.json | 66.31034675678852 | 14.13993878644115 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| teatret_vart_plassen | Teatret Vårt – Plassen | scenekunst | data/places/scenekunst/more_og_romsdal/teatret_vart_plassen/teatret_vart_plassen.json | 62.7362918885897 | 7.155736040879915 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| teater_vestland_nynorskhuset | Teater Vestland – Nynorskhuset | scenekunst | data/places/scenekunst/vestland/teater_vestland_nynorskhuset/teater_vestland_nynorskhuset.json | 61.45241505945064 | 5.851296643693358 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| det_vestnorske_teateret | Det Vestnorske Teateret | scenekunst | data/places/scenekunst/vestland/det_vestnorske_teateret/det_vestnorske_teateret.json | 60.39209329114837 | 5.321321455865965 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| beaivvas_coarvematta | Beaivváš – Čoarvemátta | scenekunst | data/places/scenekunst/finnmark/beaivvas_coarvematta/beaivvas_coarvematta.json | 69.02031504216781 | 23.03692544410359 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| uffa_huset_trondheim | UFFA-huset | subkultur | data/places/subkultur/trondelag/uffa_huset_trondheim/uffa_huset_trondheim.json | 63.436369375015 | 10.429891680665307 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ressurssenter_kvinner_trondheim | Ressurssenter for kvinner | subkultur | data/places/subkultur/trondelag/ressurssenter_kvinner_trondheim/ressurssenter_kvinner_trondheim.json | 63.427397941829156 | 10.392090968181554 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| hulen_bergen | Hulen | subkultur | data/places/subkultur/vestland/hulen_bergen/hulen_bergen.json | 60.38476280849749 | 5.325363307407874 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bergen_kjott_kulturhus | Bergen Kjøtt | subkultur | data/places/subkultur/vestland/bergen_kjott_kulturhus/bergen_kjott_kulturhus.json | 60.40188735772789 | 5.320559974203892 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tou_stavanger | Tou | subkultur | data/places/subkultur/rogaland/tou_stavanger/tou_stavanger.json | 58.96917440876424 | 5.75829995261127 | 110 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| voldslokka_pumptrack | Voldsløkka pumptrack | sport | data/places/sport/oslo/voldslokka_pumptrack/voldslokka_pumptrack.json | 59.943145607547194 | 10.754419844962298 | 140 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| trikkestallen_skatepark_trondheim | Trikkestallen Skatepark | subkultur | data/places/subkultur/trondelag/trikkestallen_skatepark_trondheim/trikkestallen_skatepark_trondheim.json | 63.43966117350392 | 10.431940352632845 | 90 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| fysak_slettebakken | Fysak Slettebakken | sport | data/places/sport/vestland/fysak_slettebakken/fysak_slettebakken.json | 60.34892315756406 | 5.361581721031116 | 110 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| arena_bekkestua | Arena Bekkestua | subkultur | data/places/subkultur/akershus/arena_bekkestua/arena_bekkestua.json | 59.920536290445376 | 10.582550428755052 | 100 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| mo_senteret_gyldenpris | MO-senteret Gyldenpris | subkultur | data/places/subkultur/vestland/mo_senteret_gyldenpris/mo_senteret_gyldenpris.json | 60.38300262501348 | 5.314376782207994 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| matfellesskap_st_petri_stavanger | Matfellesskap St. Petri | subkultur | data/places/subkultur/rogaland/matfellesskap_st_petri_stavanger/matfellesskap_st_petri_stavanger.json | 58.97006703664689 | 5.7375038082000955 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kafe_x_tromso | Kafe X | subkultur | data/places/subkultur/troms/kafe_x_tromso/kafe_x_tromso.json | 69.65340838746769 | 18.95628570193868 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| etne_kyrkje | Etne kyrkje | religion | data/places/religion/vestland/etne/etne_kyrkje/etne_kyrkje.json | 59.66966917268966 | 5.944394800224875 | 180 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| skanevik_kyrkje | Skånevik kyrkje | religion | data/places/religion/vestland/etne/skanevik_kyrkje/skanevik_kyrkje.json | 59.731915140528194 | 5.939778902454844 | 180 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| brageteatret_union_scene | Brageteatret – Union Scene | scenekunst | data/places/scenekunst/buskerud/brageteatret_union_scene/brageteatret_union_scene.json | 59.74414101262438 | 10.192462050109372 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| haugesund_teater_haut_scene | Haugesund Teater – HAUT scene | scenekunst | data/places/scenekunst/rogaland/haugesund_teater_haut_scene/haugesund_teater_haut_scene.json | 59.414116623287576 | 5.265435524247058 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ostfold_teater | Østfold Teater | scenekunst | data/places/scenekunst/ostfold/ostfold_teater/ostfold_teater.json | 59.21361486821452 | 10.92479215553184 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| turneteatret_i_trondelag | Turnéteatret i Trøndelag | scenekunst | data/places/scenekunst/trondelag/turneteatret_i_trondelag/turneteatret_i_trondelag.json | 63.792754200086115 | 11.482567963201188 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| teater_innlandet_hamar_kulturhus | Teater Innlandet – Hamar kulturhus | scenekunst | data/places/scenekunst/innlandet/teater_innlandet_hamar_kulturhus/teater_innlandet_hamar_kulturhus.json | 60.795133859406384 | 11.067054846610478 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bruddet_fjaereheia | Bruddet Fjæreheia | scenekunst | data/places/scenekunst/agder/bruddet_fjaereheia/bruddet_fjaereheia.json | 58.377773721265456 | 8.593349909139995 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| teateret_kristiansand | Teateret Kristiansand | scenekunst | data/places/scenekunst/agder/teateret_kristiansand/teateret_kristiansand.json | 58.14294361484816 | 7.99551802723939 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| rosendal_teater | Rosendal Teater | scenekunst | data/places/scenekunst/trondelag/rosendal_teater/rosendal_teater.json | 63.43668599265991 | 10.432509045023487 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| cornerteateret | Cornerteateret | scenekunst | data/places/scenekunst/vestland/cornerteateret/cornerteateret.json | 60.3826223798614 | 5.32583895135855 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| studio_bergen_carte_blanche | Studio Bergen / Carte Blanche | scenekunst | data/places/scenekunst/vestland/studio_bergen_carte_blanche/studio_bergen_carte_blanche.json | 60.39474296284379 | 5.311195329743077 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| baerum_kulturhus | Bærum Kulturhus | scenekunst | data/places/scenekunst/akershus/baerum_kulturhus/baerum_kulturhus.json | 59.889029577239945 | 10.522729052403367 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| drammens_teater | Drammens Teater | scenekunst | data/places/scenekunst/buskerud/drammens_teater/drammens_teater.json | 59.74459100305455 | 10.200444127330899 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| dramatikkens_hus | Dramatikkens hus | scenekunst | data/places/scenekunst/oslo/dramatikkens_hus/dramatikkens_hus.json | 59.91136273231394 | 10.76197612015289 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| teater_manu | Teater Manu | scenekunst | data/places/scenekunst/oslo/teater_manu/teater_manu.json | 59.92748781553136 | 10.765085831638626 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| vega_scene | Vega Scene | scenekunst | data/places/scenekunst/oslo/vega_scene/vega_scene.json | 59.91895316049889 | 10.752326830028103 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| lille_scene_sandvika | Lille Scene | scenekunst | data/places/scenekunst/akershus/lille_scene_sandvika/lille_scene_sandvika.json | 59.89083235312954 | 10.525731938534458 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sandvika_teater | Sandvika Teater | scenekunst | data/places/scenekunst/akershus/sandvika_teater/sandvika_teater.json | 59.890947742719014 | 10.524918660658095 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| fabrikken_kulturscene | Fabrikken Kulturscene | scenekunst | data/places/scenekunst/more_og_romsdal/fabrikken_kulturscene/fabrikken_kulturscene.json | 62.47325881959121 | 6.1457628556440245 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| rimi_imir_scenekunst | RIMI/IMIR Scenekunst | scenekunst | data/places/scenekunst/rogaland/rimi_imir_scenekunst/rimi_imir_scenekunst.json | 58.97217649362363 | 5.749894964318001 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| papirhuset_teater | Papirhuset Teater | scenekunst | data/places/scenekunst/vestfold/papirhuset_teater/papirhuset_teater.json | 59.26724668104939 | 10.415907691710105 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| flateskar_stordalen | Flåteskar i Stordalen | natur | data/places/natur/vestland/etne/flateskar_stordalen/flateskar_stordalen.json | 59.70495 | 6.15875 | 320 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| rullestadvatnet | Rullestadvatnet | natur | data/places/natur/vestland/etne/rullestadvatnet/rullestadvatnet.json | 59.8722 | 6.42074 | 720 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| krokavatnet_etneforkastningen | Krokavatnet og Etneforkastningen | natur | data/places/natur/vestland/etne/krokavatnet_etneforkastningen/krokavatnet_etneforkastningen.json | 59.62412 | 6.0786 | 750 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sandvikevatnet_etne | Sandvikevatnet | natur | data/places/natur/vestland/etne/sandvikevatnet_etne/sandvikevatnet_etne.json | 59.91597 | 6.36086 | 650 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| taraldsoy | Taraldsøy | natur | data/places/natur/vestland/etne/taraldsoy/taraldsoy.json | 59.71786 | 5.84176 | 420 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| grenland_friteater | Grenland Friteater | scenekunst | data/places/scenekunst/telemark/grenland_friteater/grenland_friteater.json | 59.1372387523214 | 9.64295875271934 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| samovarteateret_sor_varanger_kultursal | Samovarteateret – Sør-Varanger kultursal | scenekunst | data/places/scenekunst/finnmark/samovarteateret_sor_varanger_kultursal/samovarteateret_sor_varanger_kultursal.json | 69.72363475034705 | 30.05829806321774 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| radstua_teaterhus | Rådstua Teaterhus | scenekunst | data/places/scenekunst/troms/radstua_teaterhus/radstua_teaterhus.json | 69.65177803248783 | 18.95448465131434 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| hamar_teater | Hamar Teater | scenekunst | data/places/scenekunst/innlandet/hamar_teater/hamar_teater.json | 60.79276378226065 | 11.073747082855698 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| radhus_teatret_kongsvinger | Rådhus-Teatret | scenekunst | data/places/scenekunst/innlandet/radhus_teatret_kongsvinger/radhus_teatret_kongsvinger.json | 60.19148958316322 | 11.999663619048425 | 80 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| fotogalleriet | Fotogalleriet | kunst | data/places/kunst/oslo/places_kunst/fotogalleriet.json | 59.917455556790614 | 10.750260519179827 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kunstnerforbundet | Kunstnerforbundet | kunst | data/places/kunst/oslo/places_kunst/kunstnerforbundet.json | 59.91286247033279 | 10.735585135946035 | 65 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| edvard_munchs_atelier_ekely | Edvard Munchs atelier på Ekely | kunst | data/places/kunst/oslo/places_kunst/edvard_munchs_atelier_ekely.json | 59.92918854127767 | 10.670165670212224 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tegnerforbundet | Tegnerforbundet – senter for tegnekunst | kunst | data/places/kunst/oslo/places_kunst/tegnerforbundet.json | 59.9099817152299 | 10.74092866640025 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| unge_kunstneres_samfund | Unge Kunstneres Samfund | kunst | data/places/kunst/oslo/places_kunst/unge_kunstneres_samfund.json | 59.917046487498816 | 10.743853067869056 | 65 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| norske_grafikere | Galleri Norske Grafikere | kunst | data/places/kunst/oslo/places_kunst/norske_grafikere.json | 59.91091311290161 | 10.741742892068546 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| the_mini_bottle_gallery | The Mini Bottle Gallery | historie | data/places/historie/oslo/places_historie/the_mini_bottle_gallery.json | 59.90962587013713 | 10.743320753338548 | 50 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| galleri_lnm | Galleri LNM | kunst | data/places/kunst/oslo/places_kunst/galleri_lnm.json | 59.91082571186472 | 10.7367950879606 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ram_galleri | RAM galleri | kunst | data/places/kunst/oslo/places_kunst/ram_galleri.json | 59.91045277823502 | 10.741915500125605 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| galleri_schaeffers_gate_5 | Galleri Schaeffers Gate 5 | kunst | data/places/kunst/oslo/places_kunst/galleri_schaeffers_gate_5.json | 59.92127390279403 | 10.762304822006952 | 50 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| grafill | Grafill | kunst | data/places/kunst/oslo/places_kunst/grafill.json | 59.91646694157906 | 10.748956340457859 | 65 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| akershus_energi | Akershus EnergiPark | naeringsliv | data/places/naeringsliv/akershus/akershus_energipark.json | 59.97151165737936 | 11.072630258843615 | 100 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| fornebu_teknologipark | Telenor hovedkontor – Fornebu | naeringsliv | data/places/naeringsliv/akershus/telenor_fornebu.json | 59.899282707028654 | 10.627377014318366 | 220 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| cinemateket_oslo | Cinemateket i Oslo | film_tv | data/places/film_tv/oslo/cinemateket_oslo.json | 59.90961165359811 | 10.745752189439866 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| grand_hotel | Grand Hotel | media | data/places/media/oslo/grand_hotel.json | 59.913745246491665 | 10.739476691613683 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| chateau_neuf | Chateau Neuf | scenekunst | data/places/scenekunst/oslo/chateau_neuf.json | 59.93227611011727 | 10.71254747404495 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| house_of_nerds | House of Nerds | subkultur | data/places/subkultur/oslo/house_of_nerds.json | 59.92186714382747 | 10.75148579082984 | 60 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_aud_schonemann_vetlandsveien_69d | Blått skilt: Aud Schønemann | scenekunst | data/places/scenekunst/oslo/bla_skilt_aud_schonemann_vetlandsveien_69d.json | 59.89860830471629 | 10.846650260193258 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bitraf | Bitraf | vitenskap | data/places/vitenskap/oslo/places_vitenskap/bitraf.json | 59.92035190289846 | 10.752792129992647 | 70 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| radionette_fodested_bygdoy_alle_67 | Radionettes fødested | vitenskap | data/places/vitenskap/oslo/places_vitenskap/radionette_fodested_bygdoy_alle_67.json | 59.918959 | 10.702483 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sintef_minalab | SINTEF MiNaLab | vitenskap | data/places/vitenskap/oslo/places_vitenskap/sintef_minalab.json | 59.943728 | 10.718136 | 75 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| stk_pex_kabeltarnet | STK PEX-kabeltårnet | vitenskap | data/places/vitenskap/oslo/places_vitenskap/stk_pex_kabeltarnet.json | 59.927639 | 10.816681 | 75 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tandbergs_radiofabrikk_kjelsas | Tandbergs Radiofabrikk på Kjelsås | vitenskap | data/places/vitenskap/oslo/places_vitenskap/tandbergs_radiofabrikk_kjelsas.json | 59.96851908911736 | 10.772328336306844 | 110 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nkvts_nydalen | NKVTS – Nasjonalt kunnskapssenter om vold og traumatisk stress | psykologi | data/places/psykologi/oslo/places_psykologi/nkvts_nydalen.json | 59.9496583 | 10.7684583 | 85 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| nic_waals_institutt | Nic Waals Institutt | psykologi | data/places/psykologi/oslo/places_psykologi/nic_waals_institutt.json | 59.941911 | 10.748727 | 90 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| grefsen_gjenvinningsstasjon | Grefsen gjenvinningsstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/grefsen_gjenvinningsstasjon.json | 59.957835 | 10.772307 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| haraldrud_gjenvinningsstasjon | Haraldrud gjenvinningsstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/haraldrud_gjenvinningsstasjon.json | 59.930024 | 10.82906 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ryen_gjenvinningsstasjon | Ryen gjenvinningsstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/ryen_gjenvinningsstasjon.json | 59.895310611878 | 10.800607123316 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| smestad_gjenvinningsstasjon | Smestad gjenvinningsstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/smestad_gjenvinningsstasjon.json | 59.933906423134 | 10.672643532134 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| lindeberg_gjenvinningsstasjon | Lindeberg gjenvinningsstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/lindeberg_gjenvinningsstasjon.json | 59.932634024289 | 10.881382097351 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kampen_gjenvinningsstasjon | Kampen gjenvinningsstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/kampen_gjenvinningsstasjon.json | 59.915751178736 | 10.781616279146 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sofienbergparken_gjenvinningsstasjon | Sofienbergparken gjenvinningsstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/sofienbergparken_gjenvinningsstasjon.json | 59.923564 | 10.7656953 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| trosterud_gjenvinningsstasjon | Trosterud gjenvinningsstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/trosterud_gjenvinningsstasjon.json | 59.9251633 | 10.8652417 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| haraldrud_ombrukstelt | Haraldrud ombrukstelt | natur | data/places/natur/oslo/miljo_gjenbruk/haraldrud_ombrukstelt.json | 59.928011789331 | 10.827938318253 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gronmo_ombrukstelt | Grønmo ombrukstelt | natur | data/places/natur/oslo/miljo_gjenbruk/gronmo_ombrukstelt.json | 59.840939537522 | 10.857571363449 | 55 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| gronmo_gjenvinningsstasjon | Grønmo gjenvinningsstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/gronmo_gjenvinningsstasjon.json | 59.838517 | 10.852954 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sorenga_gjenvinningsstasjon | Sørenga gjenvinningsstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/sorenga_gjenvinningsstasjon.json | 59.903287 | 10.755634 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bygdoy_miljostasjon | Bygdøy miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/bygdoy_miljostasjon.json | 59.907555268557 | 10.6957504355 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| frysja_miljostasjon | Frysja miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/frysja_miljostasjon.json | 59.96615453292697 | 10.776552271050505 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| kringsja_miljostasjon | Kringsjå miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/kringsja_miljostasjon.json | 59.965351788047 | 10.732831121272 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| lambertseter_miljostasjon | Lambertseter miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/lambertseter_miljostasjon.json | 59.87627230526514 | 10.819358410891335 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| lindebergasen_miljostasjon | Lindebergåsen miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/lindebergasen_miljostasjon.json | 59.9311490257 | 10.885339558894 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| lindoya_miljostasjon | Lindøya miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/lindoya_miljostasjon.json | 59.892632493197 | 10.719451008405 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| mosseveien_miljostasjon | Mosseveien miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/mosseveien_miljostasjon.json | 59.880436134678 | 10.773377511603 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| munkerud_miljostasjon | Munkerud miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/munkerud_miljostasjon.json | 59.853326672748594 | 10.813825168645419 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| oppsal_miljostasjon | Oppsal miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/oppsal_miljostasjon.json | 59.901824340791 | 10.847136369269 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| skjonhaug_miljostasjon | Skjønhaug miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/skjonhaug_miljostasjon.json | 59.929208350285 | 10.868345109604 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| sogn_miljostasjon | Sogn miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/sogn_miljostasjon.json | 59.952239652135 | 10.728373723253 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| tveita_miljostasjon | Tveita miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/tveita_miljostasjon.json | 59.916287307096 | 10.847120089516 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| ulven_miljostasjon | Ulven miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/ulven_miljostasjon.json | 59.925183520438 | 10.808930424285 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_gartnerlokka_urtegata_50 | Blått skilt: Gartnerløkka | by | data/places/by/oslo/bla_skilt/bla_skilt_gartnerlokka_urtegata_50.json | 59.9132197759349 | 10.766832155693255 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_cathinka_guldberg_lovisenberggata_15a | Blått skilt: Cathinka Guldberg | helse | data/places/helse/oslo/bla_skilt/bla_skilt_cathinka_guldberg_lovisenberggata_15a.json | 59.932391051542 | 10.746584210661682 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_sulpen_keysers_gate_5 | Blått skilt: Sulpen | helse | data/places/helse/oslo/bla_skilt/bla_skilt_sulpen_keysers_gate_5.json | 59.91693099940071 | 10.743077840701527 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_vebjorn_tandberg_kongens_gate_15 | Blått skilt: Vebjørn Tandberg | vitenskap | data/places/vitenskap/oslo/bla_skilt/bla_skilt_vebjorn_tandberg_kongens_gate_15.json | 59.91045277823502 | 10.741915500125605 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| snublestein_rebekka_blatt_nordre_gate_13 | Snublestein: Rebekka Blatt | historie | data/places/historie/oslo/snublestein/snublestein_rebekka_blatt_nordre_gate_13.json | 59.92095 | 10.75657 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| snublestein_fanny_steinsapir_bjerregaards_gate_68 | Snublestein: Fanny Steinsapir | historie | data/places/historie/oslo/snublestein/snublestein_fanny_steinsapir_bjerregaards_gate_68.json | 59.92714 | 10.749515 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| snublestein_benno_damelin_schonings_gate_14 | Snublestein: Benno Damelin | historie | data/places/historie/oslo/snublestein/snublestein_benno_damelin_schonings_gate_14.json | 59.928698 | 10.723649 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| snublestein_salomon_bogomolno_d_y_jens_bjelkes_gate_64 | Snublestein: Salomon Bogomolno d.y. | historie | data/places/historie/oslo/snublestein/snublestein_salomon_bogomolno_d_y_jens_bjelkes_gate_64.json | 59.913332 | 10.772639 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| snublestein_harry_isidor_mendel_ullevalsveien_97 | Snublestein: Harry Isidor Mendel | historie | data/places/historie/oslo/snublestein/snublestein_harry_isidor_mendel_ullevalsveien_97.json | 59.933444 | 10.732789 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| snublestein_isak_kaplan_kirkegardsgata_2 | Snublestein: Isak Kaplan | historie | data/places/historie/oslo/snublestein/snublestein_isak_kaplan_kirkegardsgata_2.json | 59.921905 | 10.763554 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| hoybraten_miljostasjon | Høybråten miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/hoybraten_miljostasjon.json | 59.9469097 | 10.9242032 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_kjeglebanen_briskebyveien_21 | Blått skilt: Kjeglebanen | sport | data/places/sport/oslo/bla_skilt/bla_skilt_kjeglebanen_briskebyveien_21.json | 59.92335742553447 | 10.7148429989095 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_fredrikke_qvam_pilestredet_81 | Blått skilt: Fredrikke Qvam | politikk | data/places/politikk/oslo/bla_skilt/bla_skilt_fredrikke_qvam_pilestredet_81.json | 59.928697 | 10.7288462 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_sophie_borchgrevink_cort_adelers_gate_33 | Blått skilt: Sophie Borchgrevink | politikk | data/places/politikk/oslo/bla_skilt/bla_skilt_sophie_borchgrevink_cort_adelers_gate_33.json | 59.9124527 | 10.7242853 | 45 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_universal_presentkort_lille_grensen_7 | Blått skilt: Universal Presentkort | naeringsliv | data/places/naeringsliv/oslo/bla_skilt/bla_skilt_universal_presentkort_lille_grensen_7.json | 59.91374432154164 | 10.740907514505436 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_inger_sitter_president_harbitz_gate_19b | Blått skilt: Inger Sitter | kunst | data/places/kunst/oslo/bla_skilt/bla_skilt_inger_sitter_president_harbitz_gate_19b.json | 59.9200266813167 | 10.71660315502361 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_per_ung_jarlsborgveien_12a | Blått skilt: Per Ung | kunst | data/places/kunst/oslo/bla_skilt/bla_skilt_per_ung_jarlsborgveien_12a.json | 59.92938153766419 | 10.67074082310637 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_robert_levin_gabels_gate_46b | Blått skilt: Robert Levin | musikk | data/places/musikk/oslo/bla_skilt/bla_skilt_robert_levin_gabels_gate_46b.json | 59.91732417165451 | 10.711007825988437 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_helga_eng_waldemar_thranes_gate_42 | Blått skilt: Helga Eng | utdanning | data/places/utdanning/oslo/bla_skilt/bla_skilt_helga_eng_waldemar_thranes_gate_42.json | 59.925981063926706 | 10.744679846958872 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_thekla_resvoll_bestum_tverrvei_1 | Blått skilt: Thekla Resvoll | vitenskap | data/places/vitenskap/oslo/bla_skilt/bla_skilt_thekla_resvoll_bestum_tverrvei_1.json | 59.91922009059839 | 10.65536463614413 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_anne_cath_vestly_wergelandsveien_7 | Blått skilt: Anne-Cath Vestly | litteratur | data/places/litteratur/oslo/bla_skilt/bla_skilt_anne_cath_vestly_wergelandsveien_7.json | 59.91891459573794 | 10.731590024759551 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_krisesenteret_camilla_waldemar_thranes_gate_70 | Blått skilt: Krisesenteret Camilla | politikk | data/places/politikk/oslo/bla_skilt/bla_skilt_krisesenteret_camilla_waldemar_thranes_gate_70.json | 59.92811297225721 | 10.749175752911317 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_eyde_birkeland_bolteloekka_alle_10 | Blått skilt: Eyde og Birkeland | vitenskap | data/places/vitenskap/oslo/bla_skilt/bla_skilt_eyde_birkeland_bolteloekka_alle_10.json | 59.92927468944692 | 10.73739091653086 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_holmenkollen_sanatorium_kongeveien_26 | Blått skilt: Holmenkollen Sanatorium | by | data/places/by/oslo/bla_skilt/bla_skilt_holmenkollen_sanatorium_kongeveien_26.json | 59.96247986706183 | 10.663009019261017 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_kim_friele_haakon_tveters_vei_12 | Blått skilt: Kim Friele | politikk | data/places/politikk/oslo/bla_skilt/bla_skilt_kim_friele_haakon_tveters_vei_12.json | 59.90100375777466 | 10.835912518390394 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_elisabet_helsing_thor_olsens_gate_10 | Blått skilt: Elisabet Helsing | helse | data/places/helse/oslo/bla_skilt/bla_skilt_elisabet_helsing_thor_olsens_gate_10.json | 59.91846260753924 | 10.746789525733794 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_marcus_thrane_fredriksborgveien_18 | Blått skilt: Marcus Thrane | politikk | data/places/politikk/oslo/bla_skilt/bla_skilt_marcus_thrane_fredriksborgveien_18.json | 59.90306827345027 | 10.687513117137039 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_anna_rogstad_henrichsens_gate_3 | Blått skilt: Anna Rogstad | politikk | data/places/politikk/oslo/bla_skilt/bla_skilt_anna_rogstad_henrichsens_gate_3.json | 59.92525946253369 | 10.737431441020538 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| bla_skilt_astri_stockfleth_sofies_gate_74 | Blått skilt: Astri Stockfleth | naeringsliv | data/places/naeringsliv/oslo/bla_skilt/bla_skilt_astri_stockfleth_sofies_gate_74.json | 59.929416529092734 | 10.73480365969341 | 35 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |
| freia_fabrikken | Freia-fabrikken | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/freia_fabrikken.json | 59.925721706960225 | 10.76524607727546 | 90 | Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus. |

### lineært sted uten anchors (84)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ring_3 | Ring 3 | by | data/places/by/oslo/places/ring_3.json | 59.952359965835846 | 10.74918431139814 | 500 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| christiania_torv | Christiania Torv | by | data/places/by/oslo/places/christiania_torv.json | 59.9102351 | 10.7395879 | 150 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| prinds_christian_augusts_minde | Prinds Christian Augusts Minde | historie | data/places/historie/oslo/places_historie_added_batch_01/prinds_christian_augusts_minde.json | 59.9150905 | 10.7569061 | 120 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| krokkleiva_kongeveien | Krokkleiva / Den bergenske kongevei | historie | data/places/historie/buskerud/places_historie_buskerud_batch5/krokkleiva_kongeveien.json | 60.0609 | 10.3092 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| hagan_skredsvig | Hagan / Christian Skredsvigs kunstnerhjem | kunst | data/places/kunst/buskerud/hagan_skredsvig/hagan_skredsvig.json | 60.2269 | 9.3317 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| elverum_folkehogskole_1940 | Elverum folkehøgskole / Elverumsfullmakten | politikk | data/places/politikk/innlandet/elverum_folkehogskole_1940/elverum_folkehogskole_1940.json | 60.8828 | 11.5599 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| koppangtunet_stor_elvdal | Koppangtunet / Stor-Elvdal museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9/koppangtunet_stor_elvdal.json | 61.5708 | 11.0552 | 320 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| mustad_hunnselva_gjovik | Mustad / Hunnselva industrimiljø | naeringsliv | data/places/naeringsliv/innlandet/mustad_hunnselva_gjovik/mustad_hunnselva_gjovik.json | 60.7894 | 10.6798 | 360 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| espedalen_nikkelverk | Espedalen nikkelverk | naeringsliv | data/places/naeringsliv/innlandet/espedalen_nikkelverk/espedalen_nikkelverk.json | 61.4248 | 9.6036 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| elverum_stasjon_jernbanemiljo | Elverum stasjon / jernbanemiljø | by | data/places/by/innlandet/elverum_stasjon_jernbanemiljo/elverum_stasjon_jernbanemiljo.json | 60.8818 | 11.5621 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| moelv_stasjon_mjoslinjen | Moelv stasjon / Mjøslinjen | by | data/places/by/innlandet/moelv_stasjon_mjoslinjen/moelv_stasjon_mjoslinjen.json | 60.9337 | 10.7005 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| bastoy_skolehjem_horten | Bastøy skolehjem / institusjonshistorisk sted | historie | data/places/historie/vestfold/places_historie_vestfold_batch7/bastoy_skolehjem_horten.json | 59.3869 | 10.5318 | 620 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| christiansholm_festning_kristiansand | Christiansholm festning Kristiansand | historie | data/places/historie/agder/places_historie_agder_batch1/christiansholm_festning_kristiansand.json | 58.1452 | 8.0012 | 320 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kristiansand_domkirke_byhistorie | Kristiansand domkirke / Kvadraturen | by | data/places/by/agder/kristiansand_domkirke_byhistorie/kristiansand_domkirke_byhistorie.json | 58.1467 | 7.9956 | 320 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| mollenborg_kanonmuseum_kristiansand | Møvik fort / Kristiansand kanonmuseum | historie | data/places/historie/agder/places_historie_agder_batch2/mollenborg_kanonmuseum_kristiansand.json | 58.0915 | 7.966 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| odderoya_militaerhistorie_kristiansand | Odderøya militærhistorie Kristiansand | historie | data/places/historie/agder/odderoya_militaerhistorie_kristiansand/odderoya_militaerhistorie_kristiansand.json | 58.1392 | 8.0026 | 520 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| bredalsholmen_dokk_kristiansand | Bredalsholmen dokk Kristiansand | naeringsliv | data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand/bredalsholmen_dokk_kristiansand.json | 58.0879 | 7.979 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| stiftelsen_arkivet_kristiansand | Arkivet Kristiansand | historie | data/places/historie/agder/stiftelsen_arkivet_kristiansand/stiftelsen_arkivet_kristiansand.json | 58.1547 | 7.9814 | 360 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| gimle_gard_kristiansand | Gimle gård Kristiansand | historie | data/places/historie/agder/gimle_gard_kristiansand/gimle_gard_kristiansand.json | 58.1648 | 8.0039 | 340 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| posebyen_kristiansand_trehusby | Posebyen Kristiansand trehusby | by | data/places/by/agder/posebyen_kristiansand_trehusby/posebyen_kristiansand_trehusby.json | 58.1479 | 8.0005 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| oddernes_kirke_kristiansand | Oddernes kirke Kristiansand | historie | data/places/historie/agder/oddernes_kirke_kristiansand/oddernes_kirke_kristiansand.json | 58.1646 | 8.0346 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ds_hestmanden_kristiansand | D/S Hestmanden Kristiansand | historie | data/places/historie/agder/ds_hestmanden_kristiansand/ds_hestmanden_kristiansand.json | 58.1139 | 7.9847 | 340 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kristiansand_gamle_tollbod | Kristiansand gamle tollbod | by | data/places/by/agder/kristiansand_gamle_tollbod/kristiansand_gamle_tollbod.json | 58.1443 | 7.9976 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| oksoy_fyr_kristiansand | Oksøy fyr Kristiansand | by | data/places/by/agder/oksoy_fyr_kristiansand/oksoy_fyr_kristiansand.json | 58.0755 | 8.0523 | 520 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| gronningen_fyr_kristiansand | Grønningen fyr Kristiansand | by | data/places/by/agder/gronningen_fyr_kristiansand/gronningen_fyr_kristiansand.json | 58.0813 | 8.0925 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kristiansand_stasjon | Kristiansand stasjon | by | data/places/by/agder/kristiansand_stasjon/kristiansand_stasjon.json | 58.1457 | 7.9875 | 360 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| agder_naturmuseum_kristiansand | Agder naturmuseum Kristiansand | vitenskap | data/places/vitenskap/agder/agder_naturmuseum_kristiansand/agder_naturmuseum_kristiansand.json | 58.1635 | 8.0035 | 340 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kristiansand_katedralskole | Kristiansand katedralskole | vitenskap | data/places/vitenskap/agder/kristiansand_katedralskole/kristiansand_katedralskole.json | 58.1469 | 7.995 | 300 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lund_batteri_kristiansand | Lund batteri Kristiansand | historie | data/places/historie/agder/lund_batteri_kristiansand/lund_batteri_kristiansand.json | 58.1489 | 8.0169 | 340 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ravnedalen_kristiansand | Ravnedalen Kristiansand | natur | data/places/natur/agder/ravnedalen_kristiansand/ravnedalen_kristiansand.json | 58.1597 | 7.9778 | 520 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| fullriggeren_sorlandet_kristiansand | Fullriggeren Sørlandet Kristiansand | by | data/places/by/agder/fullriggeren_sorlandet_kristiansand/fullriggeren_sorlandet_kristiansand.json | 58.144 | 7.9941 | 360 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kristiansand_kanonmuseum_movik | Kristiansand kanonmuseum Møvik | historie | data/places/historie/agder/kristiansand_kanonmuseum_movik/kristiansand_kanonmuseum_movik.json | 58.0826 | 7.9633 | 620 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| evje_mineralsti | Evje mineralsti | vitenskap | data/places/vitenskap/agder/evje_mineralsti/evje_mineralsti.json | 58.5807 | 7.7901 | 520 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| boen_gard_kristiansand | Boen gård Kristiansand | historie | data/places/historie/agder/boen_gard_kristiansand/boen_gard_kristiansand.json | 58.2014 | 8.1118 | 420 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kristiansand_lufthavn_kjevik | Kristiansand lufthavn Kjevik | by | data/places/by/agder/kristiansand_lufthavn_kjevik/kristiansand_lufthavn_kjevik.json | 58.2042 | 8.0854 | 650 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kilden_teater_konserthus_kristiansand | Kilden teater og konserthus Kristiansand | scenekunst | data/places/scenekunst/agder/kilden_teater_konserthus_kristiansand/kilden_teater_konserthus_kristiansand.json | 58.1442 | 7.9896 | 360 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| fiskebrygga_kristiansand | Fiskebrygga Kristiansand | by | data/places/by/agder/fiskebrygga_kristiansand/fiskebrygga_kristiansand.json | 58.1449 | 7.9918 | 320 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| baneheia_kristiansand_bypark | Baneheia Kristiansand bypark | natur | data/places/natur/agder/baneheia_kristiansand_bypark/baneheia_kristiansand_bypark.json | 58.1518 | 7.9829 | 620 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| stiklestad | Stiklestad | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1/stiklestad.json | 63.7956 | 11.559 | 220 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| vagar_lofoten_storvagan | Vågar i Storvågan/Kabelvåg | by | data/places/by/nordland/vagar_lofoten_storvagan/vagar_lofoten_storvagan.json | 68.2145 | 14.4759 | 260 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| christiania_seildugsfabrik | Christiania Seildugsfabrik | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv/christiania_seildugsfabrik.json | 59.9253444010033 | 10.75475549771365 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| alnaelvstien | Alnastien – Svartdalen og Bryn | natur | data/places/natur/oslo/places_oslo_alna/alnaelvstien.json | 59.9059364 | 10.8030114 | 250 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| stilla_nydalen | Elvepartiet nedenfor Nydalsdammen | natur | data/places/natur/oslo/places_oslo_natur_akerselvarute/stilla_nydalen.json | 59.95601833126916 | 10.766397872462578 | 120 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | natur | data/places/natur/oslo/places_oslo_natur_akerselvarute/elvestrekning_bla_brenneriveien.json | 59.92000495695905 | 10.753194575921878 | 130 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| fossveien_elvestrekning | Fossveien – elvestrekning | natur | data/places/natur/oslo/places_oslo_natur_akerselvarute/fossveien_elvestrekning.json | 59.9232309947939 | 10.753360734775319 | 150 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| hausmannsomradet_elvelop | Hausmannskvartalene – elveløp | by | data/places/natur/oslo/places_oslo_natur_akerselvarute/hausmannsomradet_elvelop.json | 59.91675289691115 | 10.7617223200004 | 150 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_skullerud | Ljanselva ved Skullerud | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_skullerud.json | 59.8627529 | 10.8450942 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_hauketo | Ljanselva ved Hauketo | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_hauketo.json | 59.8506459 | 10.8094818 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_ljan | Ljanselva ved Ljan | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_ljan.json | 59.8465614 | 10.7911851 | 170 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_fiskevollen | Ljanselva ved Fiskevollen | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_fiskevollen.json | 59.842638 | 10.7799991 | 140 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| ljanselva_bunnefjorden | Ljanselva – utløp i Fiskevollbukta | natur | data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_bunnefjorden.json | 59.8420614 | 10.775801 | 120 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| schweigaards_gate_lodalen | Schweigaards gate–Lodalen veggakse | subkultur | data/places/subkultur/oslo/places_subkultur/schweigaards_gate_lodalen.json | 59.9077 | 10.7725 | 260 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kuba_akselpassasjer | Kuba-passasjene ved Akerselva | subkultur | data/places/subkultur/oslo/places_subkultur/kuba_akselpassasjer.json | 59.9236 | 10.7558 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | subkultur | data/places/subkultur/oslo/places_subkultur/brenneriveien_ingens_gate.json | 59.9186 | 10.757 | 180 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| helvete_neseblod_records | Helvete / Neseblod Records | subkultur | data/places/subkultur/oslo/places_subkultur/helvete_neseblod_records.json | 59.908405 | 10.769545 | 80 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| meteorologisk_institutt | Meteorologisk institutt | vitenskap | data/places/vitenskap/oslo/places_vitenskap/meteorologisk_institutt.json | 59.94270614863892 | 10.720621900236225 | 150 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| nobelinstituttet | Nobelinstituttet | vitenskap | data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner/nobelinstituttet.json | 59.91543154930346 | 10.721857053164658 | 150 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| psykologisk_institutt_uio | Psykologisk institutt, UiO | psykologi | data/places/psykologi/oslo/places_psykologi/psykologisk_institutt_uio.json | 59.94377072400817 | 10.713355170321078 | 110 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lisbon_tribunal_constitucional | Tribunal Constitucional / Palácio Ratton | politikk | data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_tribunal_constitucional.json | 38.7227 | -9.1421 | 100 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lisbon_conserveira_de_lisboa | Conserveira de Lisboa | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_conserveira_de_lisboa.json | 38.7098 | -9.1374 | 60 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lisbon_doclisboa | Doclisboa – Festival Internacional de Cinema | film_tv | data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_doclisboa.json | 38.7202 | -9.1463 | 250 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lisbon_instituto_superior_tecnico | Instituto Superior Técnico | vitenskap | data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_instituto_superior_tecnico.json | 38.7368 | -9.1395 | 400 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lisbon_instituto_higiene_medicina_tropical | Instituto de Higiene e Medicina Tropical | vitenskap | data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_instituto_higiene_medicina_tropical.json | 38.7041 | -9.201 | 150 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lisbon_instituto_ricardo_jorge | Instituto Nacional de Saúde Doutor Ricardo Jorge | vitenskap | data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_instituto_ricardo_jorge.json | 38.7693 | -9.1789 | 250 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| bruteigsteinen_etne | Bruteigsteinen | historie | data/places/historie/vestland/etne/bruteigsteinen_etne.json | 59.7129339197276 | 6.145592560728476 | 220 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| skanevik_fjordhotel_pippifestivalen | Skånevik Fjordhotel / Pippifestivalen | kunst | data/places/kunst/vestland/etne/skanevik_fjordhotel_pippifestivalen/skanevik_fjordhotel_pippifestivalen.json | 59.73258264147061 | 5.931458034959808 | 240 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| etneelva | Etneelva | natur | data/places/natur/vestland/etneelva/etneelva.json | 59.66611 | 5.94722 | 520 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| vikedalselva | Vikedalselva | natur | data/places/natur/rogaland/vikedalselva/vikedalselva.json | 59.4977 | 5.903 | 650 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| etneelva_forskningsplattform | Nasjonal forskingsplattform i Etneelva | vitenskap | data/places/vitenskap/vestland/etne/etneelva_forskningsplattform/etneelva_forskningsplattform.json | 59.66611 | 5.94722 | 120 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| sagene_festivitetshus | Sagene festivitetshus | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_05/sagene_festivitetshus.json | 59.93137049982586 | 10.760854064462801 | 60 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| sporveismuseet | Sporveismuseet | historie | data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_10/sporveismuseet.json | 59.931307601915144 | 10.71602648075083 | 60 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| mustadgarden_kongens_gate_3 | Mustadgården – Kongens gate 3 | historie | data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_art_sites_batch_01/mustadgarden_kongens_gate_3.json | 59.90925646800815 | 10.740826309073695 | 60 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| bla_skilt_helverschous_lokke_munkedamsveien_35 | Blått skilt: Helverschous løkke | historie | data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01/bla_skilt_helverschous_lokke_munkedamsveien_35.json | 59.911785794838465 | 10.7259247905869 | 35 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| christian_radich | Christian Radich | historie | data/places/historie/oslo/places_historie/christian_radich.json | 59.90805979135746 | 10.733834060566368 | 100 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| teateret_kristiansand | Teateret Kristiansand | scenekunst | data/places/scenekunst/agder/teateret_kristiansand/teateret_kristiansand.json | 58.14294361484816 | 7.99551802723939 | 80 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| mosneselva_etne | Mosneselva | natur | data/places/natur/vestland/etne/mosneselva_etne/mosneselva_etne.json | 59.86656 | 6.32955 | 1000 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| vaulaelva_vassdraget | Vaulaelva og Vaulovassdraget | natur | data/places/natur/vestland/etne/vaulaelva_vassdraget/vaulaelva_vassdraget.json | 59.81337 | 6.35371 | 1400 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| galleri_schaeffers_gate_5 | Galleri Schaeffers Gate 5 | kunst | data/places/kunst/oslo/places_kunst/galleri_schaeffers_gate_5.json | 59.92127390279403 | 10.762304822006952 | 50 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lisbon_santo_antonio_festival | Santo António-festivalen i Lisboa | religion | data/places/religion/europe/portugal/lisbon/lisbon_santo_antonio_festival.json | 38.7117 | -9.1297 | 700 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| kristiansand | Kristiansand | by | data/places/by/agder/kristiansand/kristiansand.json | 58.14615 | 7.9957333 | 900 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| nic_waals_institutt | Nic Waals Institutt | psykologi | data/places/psykologi/oslo/places_psykologi/nic_waals_institutt.json | 59.941911 | 10.748727 | 90 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| lesekiosk_42_munkedamsveien | Lesekiosk 42 – Munkedamsveien | litteratur | data/places/litteratur/oslo/lesekiosk/lesekiosk_42_munkedamsveien.json | 59.9122394 | 10.7272333 | 45 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| mosseveien_miljostasjon | Mosseveien miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/mosseveien_miljostasjon.json | 59.880436134678 | 10.773377511603 | 45 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |
| tveita_miljostasjon | Tveita miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/tveita_miljostasjon.json | 59.916287307096 | 10.847120089516 | 45 | Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt. |

### lav koordinatpresisjon (<4 desimaler) (72)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| tistedalen_saugbrugsforeningen | Saugbrugsforeningen / Norske Skog Saugbrugs | naeringsliv | data/places/naeringsliv/ostfold/tistedalen_saugbrugsforeningen/tistedalen_saugbrugsforeningen.json | 59.12555 | 11.407 | 360 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| brekke_sluser_haldenkanalen | Brekke sluser / Haldenkanalen | by | data/places/by/ostfold/brekke_sluser_haldenkanalen/brekke_sluser_haldenkanalen.json | 59.148 | 11.5577 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| homlungen_fyr | Homlungen fyr | by | data/places/by/ostfold/homlungen_fyr/homlungen_fyr.json | 59.016 | 11.02367 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| fiskum_gamle_kirke | Fiskum gamle kirke | historie | data/places/historie/buskerud/places_historie_buskerud_batch4/fiskum_gamle_kirke.json | 59.7069 | 9.805 | 260 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| hvalsmoen_leir | Hvalsmoen leir | historie | data/places/historie/buskerud/places_historie_buskerud_batch4/hvalsmoen_leir.json | 60.207 | 10.277 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| dagali_museum | Dagali Museum | historie | data/places/historie/buskerud/places_historie_buskerud_batch4/dagali_museum.json | 60.415 | 8.448 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| heddal_stavkirke | Heddal stavkirke | historie | data/places/historie/telemark/places_historie_telemark_batch1/heddal_stavkirke.json | 59.5794 | 9.176 | 360 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lunde_sluse_telemarkskanalen | Lunde sluse / Telemarkskanalen | by | data/places/by/telemark/lunde_sluse_telemarkskanalen/lunde_sluse_telemarkskanalen.json | 59.297 | 9.1011 | 320 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| atra_kirke_tinn | Atrå kirke | historie | data/places/historie/telemark/places_historie_telemark_batch7/atra_kirke_tinn.json | 59.9908 | 8.744 | 280 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| bo_stasjon_sorlandsbanen | Bø stasjon / Sørlandsbanen | by | data/places/by/telemark/bo_stasjon_sorlandsbanen/bo_stasjon_sorlandsbanen.json | 59.4128 | 9.066 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| mollenborg_kanonmuseum_kristiansand | Møvik fort / Kristiansand kanonmuseum | historie | data/places/historie/agder/places_historie_agder_batch2/mollenborg_kanonmuseum_kristiansand.json | 58.0915 | 7.966 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| bredalsholmen_dokk_kristiansand | Bredalsholmen dokk Kristiansand | naeringsliv | data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand/bredalsholmen_dokk_kristiansand.json | 58.0879 | 7.979 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lillesand_byhistorie_og_havn | Lillesand byhistorie og havn | by | data/places/by/agder/lillesand_byhistorie_og_havn/lillesand_byhistorie_og_havn.json | 58.2485 | 8.378 | 520 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| ryvingen_fyr_mandal | Ryvingen fyr Mandal | by | data/places/by/agder/ryvingen_fyr_mandal/ryvingen_fyr_mandal.json | 57.9661 | 7.487 | 520 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| spangereid_kirke_lindesnes | Spangereid kirke Lindesnes | historie | data/places/historie/agder/spangereid_kirke_lindesnes/spangereid_kirke_lindesnes.json | 58.038 | 7.1275 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| kvinesdal_kirke | Kvinesdal kirke | historie | data/places/historie/agder/kvinesdal_kirke/kvinesdal_kirke.json | 58.3164 | 6.96 | 320 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lista_flystasjon_farsund | Lista flystasjon Farsund | by | data/places/by/agder/lista_flystasjon_farsund/lista_flystasjon_farsund.json | 58.099 | 6.626 | 620 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| grimstad_stasjon_grimstadbanen | Grimstad stasjon / Grimstadbanen | by | data/places/by/agder/grimstad_stasjon_grimstadbanen/grimstad_stasjon_grimstadbanen.json | 58.342 | 8.5938 | 360 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| kristiansand_katedralskole | Kristiansand katedralskole | vitenskap | data/places/vitenskap/agder/kristiansand_katedralskole/kristiansand_katedralskole.json | 58.1469 | 7.995 | 300 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| fullriggeren_sorlandet_kristiansand | Fullriggeren Sørlandet Kristiansand | by | data/places/by/agder/fullriggeren_sorlandet_kristiansand/fullriggeren_sorlandet_kristiansand.json | 58.144 | 7.9941 | 360 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| audnedal_stasjon_lyngdal | Audnedal stasjon Lyngdal | by | data/places/by/agder/audnedal_stasjon_lyngdal/audnedal_stasjon_lyngdal.json | 58.3238 | 7.354 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| stiklestad | Stiklestad | historie | data/places/historie/norge/places_historie_norge_for_1500_batch1/stiklestad.json | 63.7956 | 11.559 | 220 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| sekken_slagsted | Sekken slagsted og minnestein | historie | data/places/historie/norge/places_historie_norge_for_1500_batch3/sekken_slagsted.json | 62.647 | 7.3678 | 320 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| holmengra_hvaler | Holmengrå ved Hvaler | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4/holmengra_hvaler.json | 59.027 | 11.045 | 650 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| stamford_bridge_battlefield | Stamford Bridge battlefield | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4/stamford_bridge_battlefield.json | 53.989 | -0.903 | 650 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| jelling_kongsgard | Jelling kongsgård og monumentområde | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4/jelling_kongsgard.json | 55.756 | 9.419 | 320 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| orkney_birsay | Brough of Birsay / Orknøyene | historie | data/places/historie/norge/places_historie_norge_for_1500_batch4/orkney_birsay.json | 59.136 | -3.322 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| alnaelva_hovedsteder | Alnaelva | natur | data/places/natur/oslo/places_oslo_natur_hovedsteder/alnaelva_hovedsteder.json | 59.9325 | 10.833 | 500 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| wembley_stadium_london | Wembley Stadium | sport | data/places/sport/europa/england/footballgrounds_london/wembley_stadium_london.json | 51.556 | -0.2796 | 250 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| stamford_bridge_london | Stamford Bridge | sport | data/places/sport/europa/england/footballgrounds_london/stamford_bridge_london.json | 51.4817 | -0.191 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | subkultur | data/places/subkultur/oslo/places_subkultur/brenneriveien_ingens_gate.json | 59.9186 | 10.757 | 180 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_alfama | Alfama | by | data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_alfama.json | 38.7115 | -9.13 | 500 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_lapa | Lapa | by | data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_lapa.json | 38.708 | -9.1602 | 400 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_ajuda | Ajuda | by | data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_ajuda.json | 38.7066 | -9.199 | 600 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_martim_moniz_mouraria_axis | Martim Moniz–Mouraria-aksen | by | data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_martim_moniz_mouraria_axis.json | 38.717 | -9.1361 | 350 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_gare_do_cais_do_sodre | Gare do Cais do Sodré | by | data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_gare_do_cais_do_sodre.json | 38.706 | -9.1448 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_torre_de_belem | Torre de Belém | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_torre_de_belem.json | 38.6916 | -9.216 | 150 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_se_de_lisboa | Sé de Lisboa | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_se_de_lisboa.json | 38.7099 | -9.133 | 120 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_palacio_fronteira | Palácio dos Marqueses de Fronteira | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_palacio_fronteira.json | 38.7445 | -9.19 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_igreja_de_santo_antonio | Igreja de Santo António | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_igreja_de_santo_antonio.json | 38.711 | -9.1335 | 100 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_museu_do_aljube | Museu do Aljube – Resistência e Liberdade | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_museu_do_aljube.json | 38.711 | -9.1314 | 100 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_museu_de_marinha | Museu de Marinha | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_museu_de_marinha.json | 38.6976 | -9.207 | 150 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_praca_marques_de_pombal | Praça Marquês de Pombal | politikk | data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_praca_marques_de_pombal.json | 38.725 | -9.15 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_praca_do_municipio | Praça do Município / Câmara Municipal de Lisboa | politikk | data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_praca_do_municipio.json | 38.708 | -9.137 | 120 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_avenida_24_de_julho | Avenida 24 de Julho | politikk | data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_avenida_24_de_julho.json | 38.705 | -9.1556 | 600 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_centro_cultural_de_belem | Centro Cultural de Belém | kunst | data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_centro_cultural_de_belem.json | 38.696 | -9.207 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_museu_do_oriente | Museu do Oriente | kunst | data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_museu_do_oriente.json | 38.706 | -9.1828 | 100 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_museu_arpad_szenes_vieira_da_silva | Museu Arpad Szenes – Vieira da Silva | kunst | data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_museu_arpad_szenes_vieira_da_silva.json | 38.718 | -9.1543 | 80 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_museu_bordalo_pinheiro | Museu Bordalo Pinheiro | kunst | data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_museu_bordalo_pinheiro.json | 38.7367 | -9.153 | 80 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_gremio_literario | Grémio Literário | litteratur | data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur/lisbon_gremio_literario.json | 38.711 | -9.1428 | 60 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_clube_de_fado | Clube de Fado | musikk | data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk/lisbon_clube_de_fado.json | 38.71 | -9.1297 | 60 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_teatro_nacional_d_maria_ii | Teatro Nacional D. Maria II | scenekunst | data/places/scenekunst/europe/portugal/lisbon/places_lisbon_scenekunst/lisbon_teatro_nacional_d_maria_ii.json | 38.714 | -9.139 | 80 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_parque_das_nacoes | Parque das Nações | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_parque_das_nacoes.json | 38.7681 | -9.095 | 800 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_santa_apolonia_station | Santa Apolónia Station | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_santa_apolonia_station.json | 38.714 | -9.1228 | 180 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_centro_nautico_de_belem | Centro Náutico de Belém | sport | data/places/sport/europa/portugal/sportvenues_lisbon/lisbon_centro_nautico_de_belem.json | 38.696 | -9.2076 | 250 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_miradouro_da_senhora_do_monte | Miradouro da Senhora do Monte | natur | data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_miradouro_da_senhora_do_monte.json | 38.718 | -9.1335 | 80 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_tapada_da_ajuda | Tapada da Ajuda | natur | data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_tapada_da_ajuda.json | 38.7077 | -9.19 | 1200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_jardim_gulbenkian | Jardim da Fundação Calouste Gulbenkian | natur | data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_jardim_gulbenkian.json | 38.737 | -9.1535 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_cinema_ideal | Cinema Ideal | film_tv | data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_cinema_ideal.json | 38.71 | -9.1457 | 80 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_tobis_portuguesa | Tobis Portuguesa | film_tv | data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_tobis_portuguesa.json | 38.767 | -9.1597 | 250 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_rtp | RTP – Rádio e Televisão de Portugal | media | data/places/media/europe/portugal/lisbon/places_lisbon_media/lisbon_rtp.json | 38.76 | -9.1153 | 200 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_arquivo_rtp | Arquivo RTP | media | data/places/media/europe/portugal/lisbon/places_lisbon_media/lisbon_arquivo_rtp.json | 38.7607 | -9.114 | 150 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_instituto_higiene_medicina_tropical | Instituto de Higiene e Medicina Tropical | vitenskap | data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_instituto_higiene_medicina_tropical.json | 38.7041 | -9.201 | 150 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_champalimaud_foundation | Fundação Champalimaud | vitenskap | data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap/lisbon_champalimaud_foundation.json | 38.6935 | -9.219 | 250 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| litledalen_kraftverk | Litledalen kraftverk | naeringsliv | data/places/naeringsliv/vestland/etne/litledalen_kraftverk/litledalen_kraftverk.json | 59.66306 | 6.065 | 220 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| kyrping_handelsstad | Kyrping handelsstad | by | data/places/by/vestland/etne/kyrping_handelsstad/kyrping_handelsstad.json | 59.75 | 6.11667 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| skanevik_idrettsanlegg | Skånevik idrettsanlegg | sport | data/places/sport/vestland/etne/skanevik_idrettsanlegg/skanevik_idrettsanlegg.json | 59.731 | 5.924 | 420 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| skanevik_skatepark | Skånevik skatepark | sport | data/places/sport/vestland/etne/skanevik_skatepark/skanevik_skatepark.json | 59.73 | 5.92 | 220 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| vikedalselva | Vikedalselva | natur | data/places/natur/rogaland/vikedalselva/vikedalselva.json | 59.4977 | 5.903 | 650 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| suldalslagen | Suldalslågen | natur | data/places/natur/rogaland/suldalslagen/suldalslagen.json | 59.48333 | 6.25 | 900 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| lisbon_feira_do_livro | Feira do Livro de Lisboa | litteratur | data/places/litteratur/europe/portugal/lisbon/lisbon_feira_do_livro.json | 38.727 | -9.1542 | 350 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |
| romsas_gjenvinningsstasjon | Romsås gjenvinningsstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/romsas_gjenvinningsstasjon.json | 59.964 | 10.8939 | 55 | Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler. |

### svært stor r (>=500 m) uten coordNote (66)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| kongsberg_solvverk | Kongsberg Sølvverk | naeringsliv | data/places/naeringsliv/buskerud/kongsberg_solvverk/kongsberg_solvverk.json | 59.6817 | 9.6267 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| blaafarvevaerket_modum | Blaafarveværket | naeringsliv | data/places/naeringsliv/buskerud/blaafarvevaerket_modum/blaafarvevaerket_modum.json | 59.9314 | 9.9202 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| maihaugen_lillehammer | Maihaugen | historie | data/places/historie/innlandet/places_historie_innlandet_batch1/maihaugen_lillehammer.json | 61.1124 | 10.4864 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| kaupang_bikjholberget | Kaupang / Bikjholberget | historie | data/places/historie/vestfold/places_historie_vestfold_batch1/kaupang_bikjholberget.json | 59.0474 | 10.0335 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| borrerhaugene_midgard | Borreparken / Borre-haugene | historie | data/places/historie/vestfold/places_historie_vestfold_batch1/borrerhaugene_midgard.json | 59.3805 | 10.4686 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| karljohansvern_horten | Karljohansvern Horten | historie | data/places/historie/vestfold/places_historie_vestfold_batch1/karljohansvern_horten.json | 59.4179 | 10.4891 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| molen_brunlanes_gravroysfelt | Mølen gravrøyser | historie | data/places/historie/vestfold/places_historie_vestfold_batch2/molen_brunlanes_gravroysfelt.json | 58.9696 | 9.8277 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| bastoy_skolehjem_horten | Bastøy skolehjem / institusjonshistorisk sted | historie | data/places/historie/vestfold/places_historie_vestfold_batch7/bastoy_skolehjem_horten.json | 59.3869 | 10.5318 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| vemork_rjukan_industriarv | Vemork / Rjukan industriarv | naeringsliv | data/places/naeringsliv/telemark/vemork_rjukan_industriarv/vemork_rjukan_industriarv.json | 59.8712 | 8.4916 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| heroya_industripark_porsgrunn | Herøya industripark | naeringsliv | data/places/naeringsliv/telemark/heroya_industripark_porsgrunn/heroya_industripark_porsgrunn.json | 59.1117 | 9.6405 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| ny_hellesund_uthavn_sogne | Ny-Hellesund uthavn | by | data/places/by/agder/ny_hellesund_uthavn_sogne/ny_hellesund_uthavn_sogne.json | 58.0545 | 7.8314 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lindesnes_fyr | Lindesnes fyr | by | data/places/by/agder/lindesnes_fyr/lindesnes_fyr.json | 57.9824 | 7.0477 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| knaben_gruver_kvinesdal | Knaben gruver Kvinesdal | naeringsliv | data/places/naeringsliv/agder/knaben_gruver_kvinesdal/knaben_gruver_kvinesdal.json | 58.6746 | 7.0978 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| risor_trehusby_byhistorie | Risør trehusby / byhistorie | by | data/places/by/agder/risor_trehusby_byhistorie/risor_trehusby_byhistorie.json | 58.7209 | 9.2348 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| tvedestrand_byhistorie_og_havn | Tvedestrand byhistorie og havn | by | data/places/by/agder/tvedestrand_byhistorie_og_havn/tvedestrand_byhistorie_og_havn.json | 58.6223 | 8.9312 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| flekkefjord_hollenderbyen | Flekkefjord Hollenderbyen | by | data/places/by/agder/flekkefjord_hollenderbyen/flekkefjord_hollenderbyen.json | 58.2972 | 6.6606 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| farsund_byhistorie_havn | Farsund byhistorie og havn | by | data/places/by/agder/farsund_byhistorie_havn/farsund_byhistorie_havn.json | 58.0956 | 6.8046 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lista_fyr | Lista fyr | by | data/places/by/agder/lista_fyr/lista_fyr.json | 58.1097 | 6.5683 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| odderoya_militaerhistorie_kristiansand | Odderøya militærhistorie Kristiansand | historie | data/places/historie/agder/odderoya_militaerhistorie_kristiansand/odderoya_militaerhistorie_kristiansand.json | 58.1392 | 8.0026 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lyngor_uthavn_tvedestrand | Lyngør uthavn Tvedestrand | by | data/places/by/agder/lyngor_uthavn_tvedestrand/lyngor_uthavn_tvedestrand.json | 58.6338 | 9.1307 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lillesand_byhistorie_og_havn | Lillesand byhistorie og havn | by | data/places/by/agder/lillesand_byhistorie_og_havn/lillesand_byhistorie_og_havn.json | 58.2485 | 8.378 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| merdo_uthavn_arendal | Merdø uthavn Arendal | by | data/places/by/agder/merdo_uthavn_arendal/merdo_uthavn_arendal.json | 58.4148 | 8.7705 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| bragdoya_kystkultursenter | Bragdøya kystkultursenter | natur | data/places/natur/agder/bragdoya_kystkultursenter/bragdoya_kystkultursenter.json | 58.1258 | 7.9439 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| ryvingen_fyr_mandal | Ryvingen fyr Mandal | by | data/places/by/agder/ryvingen_fyr_mandal/ryvingen_fyr_mandal.json | 57.9661 | 7.487 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| flekkefjordbanen_sira | Flekkefjordbanen Sira | by | data/places/by/agder/flekkefjordbanen_sira/flekkefjordbanen_sira.json | 58.4168 | 6.6629 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| evjemoen_leir_evje | Evjemoen leir | historie | data/places/historie/agder/evjemoen_leir_evje/evjemoen_leir_evje.json | 58.5894 | 7.8038 | 500 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| oksoy_fyr_kristiansand | Oksøy fyr Kristiansand | by | data/places/by/agder/oksoy_fyr_kristiansand/oksoy_fyr_kristiansand.json | 58.0755 | 8.0523 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| nordberg_fort_lista | Nordberg fort Lista | historie | data/places/historie/agder/nordberg_fort_lista/nordberg_fort_lista.json | 58.0907 | 6.6212 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| torungen_fyr_arendal | Torungen fyr Arendal | by | data/places/by/agder/torungen_fyr_arendal/torungen_fyr_arendal.json | 58.3927 | 8.7917 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lista_flystasjon_farsund | Lista flystasjon Farsund | by | data/places/by/agder/lista_flystasjon_farsund/lista_flystasjon_farsund.json | 58.099 | 6.626 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| tonstad_kraftverk_sirdal | Tonstad kraftverk Sirdal | naeringsliv | data/places/naeringsliv/agder/tonstad_kraftverk_sirdal/tonstad_kraftverk_sirdal.json | 58.6622 | 6.7169 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| justoy_kystkultur_lillesand | Justøy kystkultur Lillesand | natur | data/places/natur/agder/justoy_kystkultur_lillesand/justoy_kystkultur_lillesand.json | 58.2076 | 8.2864 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| tingvatn_fornminnepark_haegebostad | Tingvatn fornminnepark Hægebostad | historie | data/places/historie/agder/tingvatn_fornminnepark_haegebostad/tingvatn_fornminnepark_haegebostad.json | 58.3752 | 7.2049 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| ravnedalen_kristiansand | Ravnedalen Kristiansand | natur | data/places/natur/agder/ravnedalen_kristiansand/ravnedalen_kristiansand.json | 58.1597 | 7.9778 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| spangereidkanalen_lindesnes | Spangereidkanalen Lindesnes | by | data/places/by/agder/spangereidkanalen_lindesnes/spangereidkanalen_lindesnes.json | 58.0372 | 7.1268 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| furulunden_mandal_kulturpark | Furulunden Mandal kulturpark | natur | data/places/natur/agder/furulunden_mandal_kulturpark/furulunden_mandal_kulturpark.json | 58.0207 | 7.4525 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| kristiansand_kanonmuseum_movik | Kristiansand kanonmuseum Møvik | historie | data/places/historie/agder/kristiansand_kanonmuseum_movik/kristiansand_kanonmuseum_movik.json | 58.0826 | 7.9633 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| evje_mineralsti | Evje mineralsti | vitenskap | data/places/vitenskap/agder/evje_mineralsti/evje_mineralsti.json | 58.5807 | 7.7901 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| kristiansand_lufthavn_kjevik | Kristiansand lufthavn Kjevik | by | data/places/by/agder/kristiansand_lufthavn_kjevik/kristiansand_lufthavn_kjevik.json | 58.2042 | 8.0854 | 650 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| skjernoy_kystkultur_lindesnes | Skjernøy kystkultur Lindesnes | natur | data/places/natur/agder/skjernoy_kystkultur_lindesnes/skjernoy_kystkultur_lindesnes.json | 58.0008 | 7.5207 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| baneheia_kristiansand_bypark | Baneheia Kristiansand bypark | natur | data/places/natur/agder/baneheia_kristiansand_bypark/baneheia_kristiansand_bypark.json | 58.1518 | 7.9829 | 620 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| dommesmoen_grimstad | Dømmesmoen Grimstad | vitenskap | data/places/vitenskap/agder/dommesmoen_grimstad/dommesmoen_grimstad.json | 58.3566 | 8.5714 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| laudal_kraftverk_lindesnes | Laudal kraftverk Lindesnes | naeringsliv | data/places/naeringsliv/agder/laudal_kraftverk_lindesnes/laudal_kraftverk_lindesnes.json | 58.2695 | 7.5093 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| brokke_kraftverk_valle | Brokke kraftverk Valle | naeringsliv | data/places/naeringsliv/agder/brokke_kraftverk_valle/brokke_kraftverk_valle.json | 59.0677 | 7.5249 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| holen_kraftverk_bykle | Holen kraftverk Bykle | naeringsliv | data/places/naeringsliv/agder/holen_kraftverk_bykle/holen_kraftverk_bykle.json | 59.4422 | 7.3834 | 560 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| rudskogen_motorsenter | Rudskogen Motorsenter | sport | data/places/sport/europa/norway/places_motorsport_ostlandet/rudskogen_motorsenter.json | 59.3759 | 11.2552 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_city | Lisboa | by | data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_city.json | 38.7223 | -9.1393 | 3000 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_alfama | Alfama | by | data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_alfama.json | 38.7115 | -9.13 | 500 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_ponte_25_de_abril | Ponte 25 de Abril | by | data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_ponte_25_de_abril.json | 38.6892 | -9.1772 | 600 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_avenida_da_liberdade | Avenida da Liberdade | by | data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_avenida_da_liberdade.json | 38.7195 | -9.1455 | 600 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_belem_bydel | Belém | by | data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_belem_bydel.json | 38.6975 | -9.2069 | 900 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_alcantara | Alcântara | by | data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_alcantara.json | 38.7062 | -9.1763 | 700 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_campo_de_ourique | Campo de Ourique | by | data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_campo_de_ourique.json | 38.7196 | -9.1701 | 500 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_ajuda | Ajuda | by | data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_ajuda.json | 38.7066 | -9.199 | 600 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_avenida_24_de_julho | Avenida 24 de Julho | politikk | data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk/lisbon_avenida_24_de_julho.json | 38.705 | -9.1556 | 600 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_parque_das_nacoes | Parque das Nações | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_parque_das_nacoes.json | 38.7681 | -9.095 | 800 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_aeroporto_humberto_delgado_tap_headquarters | Aeroporto Humberto Delgado / TAP Headquarters | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_aeroporto_humberto_delgado_tap_headquarters.json | 38.7742 | -9.1342 | 600 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_monsanto | Parque Florestal de Monsanto | natur | data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_monsanto.json | 38.7314 | -9.1828 | 1500 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_tapada_da_ajuda | Tapada da Ajuda | natur | data/places/natur/europe/portugal/lisbon/places_lisbon_natur/lisbon_tapada_da_ajuda.json | 38.7077 | -9.19 | 1200 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| etnesjoen_tettstad | Etnesjøen / Etne sentrum | by | data/places/by/vestland/etne/etnesjoen_tettstad/etnesjoen_tettstad.json | 59.66480336942738 | 5.93304783527308 | 650 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| skanevik_sentrum | Skånevik sentrum | by | data/places/by/vestland/etne/skanevik_sentrum/skanevik_sentrum.json | 59.73304523331509 | 5.934334449411551 | 520 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| gurine_johan_ebnes_minde | Boksamlinga Gurine og Johan Ebnes Minde | litteratur | data/places/litteratur/vestland/etne/gurine_johan_ebnes_minde/gurine_johan_ebnes_minde.json | 59.70492905372869 | 5.824738133852842 | 650 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| osnes_discgolfbane | Osnes Discgolfbane | sport | data/places/sport/vestland/etne/osnes_discgolfbane/osnes_discgolfbane.json | 59.65026805681819 | 5.900616945851397 | 500 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_tram_28 | Tram 28 (Eléctrico 28) | by | data/places/by/europe/portugal/lisbon/lisbon_tram_28.json | 38.7129 | -9.1377 | 800 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_santo_antonio_festival | Santo António-festivalen i Lisboa | religion | data/places/religion/europe/portugal/lisbon/lisbon_santo_antonio_festival.json | 38.7117 | -9.1297 | 700 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |
| lisbon_marchas_populares | Marchas Populares de Lisboa | scenekunst | data/places/scenekunst/europe/portugal/lisbon/lisbon_marchas_populares.json | 38.7202 | -9.1455 | 800 | Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll. |

### park/stort område uten anchors eller coordNote (115)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| hallingdal_museum_nesbyen | Hallingdal Museum Nesbyen | historie | data/places/historie/buskerud/places_historie_buskerud_batch2/hallingdal_museum_nesbyen.json | 60.5652 | 9.1013 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| eggedal_molle | Eggedal Mølle | naeringsliv | data/places/naeringsliv/buskerud/eggedal_molle/eggedal_molle.json | 60.2311 | 9.3504 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| drammen_tollbod_havn | Drammen tollbod / havneområdet | by | data/places/by/buskerud/drammen_tollbod_havn/drammen_tollbod_havn.json | 59.7434 | 10.2066 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| laagdalsmuseet | Lågdalsmuseet | historie | data/places/historie/buskerud/places_historie_buskerud_batch4/laagdalsmuseet.json | 59.6678 | 9.6569 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| gulskogen_gard | Gulskogen gård | historie | data/places/historie/buskerud/places_historie_buskerud_batch5/gulskogen_gard.json | 59.7336 | 10.1577 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hemsedal_bygdatun | Hemsedal Bygdatun / Øvre Løkji | historie | data/places/historie/buskerud/places_historie_buskerud_batch5/hemsedal_bygdatun.json | 60.8578 | 8.6409 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| lier_sykehus_historisk_omrade | Lier sykehus / historisk område | historie | data/places/historie/buskerud/places_historie_buskerud_batch6/lier_sykehus_historisk_omrade.json | 59.7867 | 10.2871 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| vikersund_stasjon_randsfjordbanen | Vikersund stasjon / Randsfjordbanen | by | data/places/by/buskerud/vikersund_stasjon_randsfjordbanen/vikersund_stasjon_randsfjordbanen.json | 59.9655 | 9.9986 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| norsk_skogmuseum_elverum | Norsk Skogmuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch2/norsk_skogmuseum_elverum.json | 60.8837 | 11.5627 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| glomdalsmuseet_elverum | Glomdalsmuseet | historie | data/places/historie/innlandet/places_historie_innlandet_batch2/glomdalsmuseet_elverum.json | 60.8848 | 11.5558 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hundorp_dale_gudbrand | Hundorp / Dale-Gudbrands gard | historie | data/places/historie/innlandet/places_historie_innlandet_batch3/hundorp_dale_gudbrand.json | 61.5486 | 9.9427 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| folldal_gruver | Folldal gruver | naeringsliv | data/places/naeringsliv/innlandet/folldal_gruver/folldal_gruver.json | 62.1321 | 9.9973 | 480 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| raufoss_industripark_ammunisjon | Raufoss industripark / ammunisjonsfabrikken | naeringsliv | data/places/naeringsliv/innlandet/raufoss_industripark_ammunisjon/raufoss_industripark_ammunisjon.json | 60.7299 | 10.6164 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| oye_stavkirke | Øye stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch5/oye_stavkirke.json | 61.1713 | 8.3996 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hedalen_stavkirke | Hedalen stavkirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch5/hedalen_stavkirke.json | 60.6484 | 9.7327 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| finnetunet_skogfinsk_museum | Finnetunet / skogfinsk museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch6/finnetunet_skogfinsk_museum.json | 60.4186 | 12.4019 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| sor_fron_kirke_gudbrandsdalsdomen | Sør-Fron kirke / Gudbrandsdalsdomen | historie | data/places/historie/innlandet/places_historie_innlandet_batch6/sor_fron_kirke_gudbrandsdalsdomen.json | 61.5567 | 9.9407 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| odalstunet_sor_odal | Odalstunet | historie | data/places/historie/innlandet/places_historie_innlandet_batch6/odalstunet_sor_odal.json | 60.2521 | 11.6846 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| eidskog_museum_almenninga | Eidskog museum / Almenninga | historie | data/places/historie/innlandet/places_historie_innlandet_batch6/eidskog_museum_almenninga.json | 60.0347 | 12.1291 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| rendalen_bygdemuseum | Rendalen bygdemuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch7/rendalen_bygdemuseum.json | 61.7585 | 11.1905 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| proysenstua_rudshogda | Prøysenstua / Rudshøgda | litteratur | data/places/litteratur/innlandet/proysenstua_rudshogda/proysenstua_rudshogda.json | 60.9127 | 10.7259 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| gausdal_bygdetun | Gausdal bygdetun | historie | data/places/historie/innlandet/places_historie_innlandet_batch8/gausdal_bygdetun.json | 61.2344 | 10.2255 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| husantunet_alvdal_bygdemuseum | Husantunet / Alvdal bygdemuseum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9/husantunet_alvdal_bygdemuseum.json | 62.1086 | 10.6311 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| koppangtunet_stor_elvdal | Koppangtunet / Stor-Elvdal museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9/koppangtunet_stor_elvdal.json | 61.5708 | 11.0552 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tylldalen_bygdetun | Tylldalen bygdetun | historie | data/places/historie/innlandet/places_historie_innlandet_batch9/tylldalen_bygdetun.json | 62.1826 | 10.7551 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| nord_odal_bygdetun_sand | Nord-Odal bygdetun / Sand | historie | data/places/historie/innlandet/places_historie_innlandet_batch10/nord_odal_bygdetun_sand.json | 60.3894 | 11.5375 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| etnedal_bygdetun_bruflat | Etnedal bygdetun / Bruflat | historie | data/places/historie/innlandet/places_historie_innlandet_batch11/etnedal_bygdetun_bruflat.json | 60.8887 | 9.6424 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| mustad_hunnselva_gjovik | Mustad / Hunnselva industrimiljø | naeringsliv | data/places/naeringsliv/innlandet/mustad_hunnselva_gjovik/mustad_hunnselva_gjovik.json | 60.7894 | 10.6798 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| brumunddal_molle_industri | Brumunddal mølle / industrimiljø | naeringsliv | data/places/naeringsliv/innlandet/brumunddal_molle_industri/brumunddal_molle_industri.json | 60.8825 | 10.9394 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| heidal_kirke | Heidal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch12/heidal_kirke.json | 61.7482 | 9.2701 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| aurdal_kirke | Aurdal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch13/aurdal_kirke.json | 60.9236 | 9.4118 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| espedalen_nikkelverk | Espedalen nikkelverk | naeringsliv | data/places/naeringsliv/innlandet/espedalen_nikkelverk/espedalen_nikkelverk.json | 61.4248 | 9.6036 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| sanderud_sykehus_historisk_omrade | Sanderud sykehus / historisk område | historie | data/places/historie/innlandet/places_historie_innlandet_batch14/sanderud_sykehus_historisk_omrade.json | 60.7798 | 11.1805 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| romedal_kirke | Romedal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch14/romedal_kirke.json | 60.7493 | 11.2508 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| snertingdal_kirke | Snertingdal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch14/snertingdal_kirke.json | 60.8769 | 10.4596 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| otta_stasjon_gudbrandsdalen | Otta stasjon / Gudbrandsdalen | by | data/places/by/innlandet/otta_stasjon_gudbrandsdalen/otta_stasjon_gudbrandsdalen.json | 61.7712 | 9.5352 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| os_kirke_osterdalen | Os kirke Østerdalen | historie | data/places/historie/innlandet/places_historie_innlandet_batch15/os_kirke_osterdalen.json | 62.4962 | 11.2238 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| grue_finnskog_kirke | Grue Finnskog kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17/grue_finnskog_kirke.json | 60.4362 | 12.4486 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| alvdal_kirke | Alvdal kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch17/alvdal_kirke.json | 62.1081 | 10.6302 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| oyer_kirke | Øyer kirke | historie | data/places/historie/innlandet/places_historie_innlandet_batch18/oyer_kirke.json | 61.2651 | 10.4131 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| einunna_kraftverk_folldal | Einunna kraftverk / Folldal | naeringsliv | data/places/naeringsliv/innlandet/einunna_kraftverk_folldal/einunna_kraftverk_folldal.json | 62.1341 | 10.0045 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| borrerhaugene_midgard | Borreparken / Borre-haugene | historie | data/places/historie/vestfold/places_historie_vestfold_batch1/borrerhaugene_midgard.json | 59.3805 | 10.4686 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hvalfangstmuseet_sandefjord | Hvalfangstmuseet Sandefjord | historie | data/places/historie/vestfold/places_historie_vestfold_batch1/hvalfangstmuseet_sandefjord.json | 59.1307 | 10.2246 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| molen_brunlanes_gravroysfelt | Mølen gravrøyser | historie | data/places/historie/vestfold/places_historie_vestfold_batch2/molen_brunlanes_gravroysfelt.json | 58.9696 | 9.8277 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hoyjord_stavkirke | Høyjord stavkirke | historie | data/places/historie/vestfold/places_historie_vestfold_batch3/hoyjord_stavkirke.json | 59.3047 | 10.1128 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| notteroy_kirke_faerder | Nøtterøy kirke | historie | data/places/historie/vestfold/places_historie_vestfold_batch4/notteroy_kirke_faerder.json | 59.2278 | 10.4074 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| kodal_kirke_sandefjord | Kodal kirke | historie | data/places/historie/vestfold/places_historie_vestfold_batch4/kodal_kirke_sandefjord.json | 59.2203 | 10.1295 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| sandefjord_kurbad | Sandefjord Kurbad | by | data/places/by/vestfold/sandefjord_kurbad/sandefjord_kurbad.json | 59.1291 | 10.2241 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| svarstad_kirke_lardal | Svarstad kirke / Lågendalen | historie | data/places/historie/vestfold/places_historie_vestfold_batch6/svarstad_kirke_lardal.json | 59.4019 | 9.9592 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| bastoy_skolehjem_horten | Bastøy skolehjem / institusjonshistorisk sted | historie | data/places/historie/vestfold/places_historie_vestfold_batch7/bastoy_skolehjem_horten.json | 59.3869 | 10.5318 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| sandefjord_stasjon_vestfoldbanen | Sandefjord stasjon / Vestfoldbanen | by | data/places/by/vestfold/sandefjord_stasjon_vestfoldbanen/sandefjord_stasjon_vestfoldbanen.json | 59.1317 | 10.2244 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| heddal_stavkirke | Heddal stavkirke | historie | data/places/historie/telemark/places_historie_telemark_batch1/heddal_stavkirke.json | 59.5794 | 9.176 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| brekkeparken_skien | Brekkeparken Skien | historie | data/places/historie/telemark/places_historie_telemark_batch1/brekkeparken_skien.json | 59.2072 | 9.6005 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| morgedal_norsk_skieventyr | Morgedal / Norsk Skieventyr | sport | data/places/sport/europa/norway/telemark/morgedal_norsk_skieventyr/morgedal_norsk_skieventyr.json | 59.4776 | 8.4267 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| dalen_hotel_tokke | Dalen Hotel | naeringsliv | data/places/naeringsliv/telemark/dalen_hotel_tokke/dalen_hotel_tokke.json | 59.4446 | 8.0081 | 340 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| kjeldal_sluse_telemarkskanalen | Kjeldal sluse / Telemarkskanalen | by | data/places/by/telemark/kjeldal_sluse_telemarkskanalen/kjeldal_sluse_telemarkskanalen.json | 59.2961 | 9.1414 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hjartdal_kirke | Hjartdal kirke | historie | data/places/historie/telemark/places_historie_telemark_batch5/hjartdal_kirke.json | 59.6113 | 8.7386 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| drangedal_kirke | Drangedal kirke | historie | data/places/historie/telemark/places_historie_telemark_batch5/drangedal_kirke.json | 59.0977 | 9.0582 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| nissedal_kyrkje | Nissedal kyrkje | historie | data/places/historie/telemark/places_historie_telemark_batch5/nissedal_kyrkje.json | 59.1648 | 8.5147 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| heroya_industripark_porsgrunn | Herøya industripark | naeringsliv | data/places/naeringsliv/telemark/heroya_industripark_porsgrunn/heroya_industripark_porsgrunn.json | 59.1117 | 9.6405 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| fyresdal_kyrkje | Fyresdal kyrkje | historie | data/places/historie/telemark/places_historie_telemark_batch6/fyresdal_kyrkje.json | 59.1886 | 8.0962 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| klosteroya_union_skien | Klosterøya / Union Bruk Skien | naeringsliv | data/places/naeringsliv/telemark/klosteroya_union_skien/klosteroya_union_skien.json | 59.2044 | 9.6026 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| setesdalsmuseet_rysstad | Setesdalsmuseet Rysstad | historie | data/places/historie/agder/places_historie_agder_batch1/setesdalsmuseet_rysstad.json | 59.0988 | 7.5353 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| knaben_gruver_kvinesdal | Knaben gruver Kvinesdal | naeringsliv | data/places/naeringsliv/agder/knaben_gruver_kvinesdal/knaben_gruver_kvinesdal.json | 58.6746 | 7.0978 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| mandal_kirke_byhistorie | Mandal kirke / byhistorie | by | data/places/by/agder/mandal_kirke_byhistorie/mandal_kirke_byhistorie.json | 58.0276 | 7.4552 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tyholmen_arendal_byhistorie | Tyholmen Arendal | by | data/places/by/agder/tyholmen_arendal_byhistorie/tyholmen_arendal_byhistorie.json | 58.4597 | 8.7666 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| flekkefjord_hollenderbyen | Flekkefjord Hollenderbyen | by | data/places/by/agder/flekkefjord_hollenderbyen/flekkefjord_hollenderbyen.json | 58.2972 | 6.6606 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| odderoya_militaerhistorie_kristiansand | Odderøya militærhistorie Kristiansand | historie | data/places/historie/agder/odderoya_militaerhistorie_kristiansand/odderoya_militaerhistorie_kristiansand.json | 58.1392 | 8.0026 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| bredalsholmen_dokk_kristiansand | Bredalsholmen dokk Kristiansand | naeringsliv | data/places/naeringsliv/agder/bredalsholmen_dokk_kristiansand/bredalsholmen_dokk_kristiansand.json | 58.0879 | 7.979 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| setesdalsbanen_grovane | Setesdalsbanen Grovane | by | data/places/by/agder/setesdalsbanen_grovane/setesdalsbanen_grovane.json | 58.2697 | 7.9737 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tromoy_kirke_arendal | Tromøy kirke Arendal | historie | data/places/historie/agder/tromoy_kirke_arendal/tromoy_kirke_arendal.json | 58.4614 | 8.8739 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| merdo_uthavn_arendal | Merdø uthavn Arendal | by | data/places/by/agder/merdo_uthavn_arendal/merdo_uthavn_arendal.json | 58.4148 | 8.7705 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| bragdoya_kystkultursenter | Bragdøya kystkultursenter | natur | data/places/natur/agder/bragdoya_kystkultursenter/bragdoya_kystkultursenter.json | 58.1258 | 7.9439 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| ryvingen_fyr_mandal | Ryvingen fyr Mandal | by | data/places/by/agder/ryvingen_fyr_mandal/ryvingen_fyr_mandal.json | 57.9661 | 7.487 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| valle_kyrkje_setesdal | Valle kyrkje Setesdal | historie | data/places/historie/agder/valle_kyrkje_setesdal/valle_kyrkje_setesdal.json | 59.2132 | 7.5361 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| flekkefjordbanen_sira | Flekkefjordbanen Sira | by | data/places/by/agder/flekkefjordbanen_sira/flekkefjordbanen_sira.json | 58.4168 | 6.6629 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| bakke_kirke_flekkefjord | Bakke kirke Flekkefjord | historie | data/places/historie/agder/bakke_kirke_flekkefjord/bakke_kirke_flekkefjord.json | 58.3807 | 6.6641 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| mandal_museum_andorsengarden | Mandal Museum / Andorsengården | historie | data/places/historie/agder/mandal_museum_andorsengarden/mandal_museum_andorsengarden.json | 58.0272 | 7.4538 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| boylefoss_kraftverk_froland | Bøylefoss kraftverk Froland | naeringsliv | data/places/naeringsliv/agder/boylefoss_kraftverk_froland/boylefoss_kraftverk_froland.json | 58.5689 | 8.6412 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| lyngdal_kirke | Lyngdal kirke | historie | data/places/historie/agder/lyngdal_kirke/lyngdal_kirke.json | 58.1379 | 7.0704 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| hidra_kirke_flekkefjord | Hidra kirke Flekkefjord | historie | data/places/historie/agder/hidra_kirke_flekkefjord/hidra_kirke_flekkefjord.json | 58.2266 | 6.5727 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| arendal_gamle_radhus | Arendal gamle rådhus | by | data/places/by/agder/arendal_gamle_radhus/arendal_gamle_radhus.json | 58.4593 | 8.7661 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| oksoy_fyr_kristiansand | Oksøy fyr Kristiansand | by | data/places/by/agder/oksoy_fyr_kristiansand/oksoy_fyr_kristiansand.json | 58.0755 | 8.0523 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| kvinesdal_kirke | Kvinesdal kirke | historie | data/places/historie/agder/kvinesdal_kirke/kvinesdal_kirke.json | 58.3164 | 6.96 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| feda_kirke_kvinesdal | Feda kirke Kvinesdal | historie | data/places/historie/agder/feda_kirke_kvinesdal/feda_kirke_kvinesdal.json | 58.2673 | 6.8261 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| konsmo_kirke_lyngdal | Konsmo kirke Lyngdal | historie | data/places/historie/agder/konsmo_kirke_lyngdal/konsmo_kirke_lyngdal.json | 58.2876 | 7.3591 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tonstad_kirke_sirdal | Tonstad kirke Sirdal | historie | data/places/historie/agder/tonstad_kirke_sirdal/tonstad_kirke_sirdal.json | 58.6629 | 6.7162 | 340 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| flekkefjord_museum | Flekkefjord museum | historie | data/places/historie/agder/flekkefjord_museum/flekkefjord_museum.json | 58.2971 | 6.6592 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| torungen_fyr_arendal | Torungen fyr Arendal | by | data/places/by/agder/torungen_fyr_arendal/torungen_fyr_arendal.json | 58.3927 | 8.7917 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| bomuldsfabriken_arendal | Bomuldsfabriken Arendal | naeringsliv | data/places/naeringsliv/agder/bomuldsfabriken_arendal/bomuldsfabriken_arendal.json | 58.4564 | 8.7467 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| oyestad_kirke_arendal | Øyestad kirke Arendal | historie | data/places/historie/agder/oyestad_kirke_arendal/oyestad_kirke_arendal.json | 58.4299 | 8.7009 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| austre_moland_kirke_arendal | Austre Moland kirke Arendal | historie | data/places/historie/agder/austre_moland_kirke_arendal/austre_moland_kirke_arendal.json | 58.5084 | 8.7988 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| arendal_stasjon | Arendal stasjon | by | data/places/by/agder/arendal_stasjon/arendal_stasjon.json | 58.4619 | 8.7723 | 360 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tonstad_kraftverk_sirdal | Tonstad kraftverk Sirdal | naeringsliv | data/places/naeringsliv/agder/tonstad_kraftverk_sirdal/tonstad_kraftverk_sirdal.json | 58.6622 | 6.7169 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| trefoldighetskirken_arendal | Trefoldighetskirken Arendal | by | data/places/by/agder/trefoldighetskirken_arendal/trefoldighetskirken_arendal.json | 58.4611 | 8.7668 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| flosta_kirke_arendal | Flosta kirke Arendal | historie | data/places/historie/agder/flosta_kirke_arendal/flosta_kirke_arendal.json | 58.4854 | 9.0167 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| flekkefjord_kirke_byhistorie | Flekkefjord kirke / byhistorie | by | data/places/by/agder/flekkefjord_kirke_byhistorie/flekkefjord_kirke_byhistorie.json | 58.2978 | 6.6602 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| justoy_kystkultur_lillesand | Justøy kystkultur Lillesand | natur | data/places/natur/agder/justoy_kystkultur_lillesand/justoy_kystkultur_lillesand.json | 58.2076 | 8.2864 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| tingvatn_fornminnepark_haegebostad | Tingvatn fornminnepark Hægebostad | historie | data/places/historie/agder/tingvatn_fornminnepark_haegebostad/tingvatn_fornminnepark_haegebostad.json | 58.3752 | 7.2049 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| ravnedalen_kristiansand | Ravnedalen Kristiansand | natur | data/places/natur/agder/ravnedalen_kristiansand/ravnedalen_kristiansand.json | 58.1597 | 7.9778 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| pusnes_mekaniske_verksted_arendal | Pusnes mekaniske verksted Arendal | naeringsliv | data/places/naeringsliv/agder/pusnes_mekaniske_verksted_arendal/pusnes_mekaniske_verksted_arendal.json | 58.4647 | 8.8222 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| arendal_tollbod | Arendal tollbod | by | data/places/by/agder/arendal_tollbod/arendal_tollbod.json | 58.4589 | 8.7674 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| furulunden_mandal_kulturpark | Furulunden Mandal kulturpark | natur | data/places/natur/agder/furulunden_mandal_kulturpark/furulunden_mandal_kulturpark.json | 58.0207 | 7.4525 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| setesdal_mineralpark_evje | Setesdal mineralpark Evje | vitenskap | data/places/vitenskap/agder/setesdal_mineralpark_evje/setesdal_mineralpark_evje.json | 58.5949 | 7.7867 | 460 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| arendal_sjofartsmuseum | Arendal sjøfartsmuseum | historie | data/places/historie/agder/arendal_sjofartsmuseum/arendal_sjofartsmuseum.json | 58.4595 | 8.7668 | 320 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| skjernoy_kystkultur_lindesnes | Skjernøy kystkultur Lindesnes | natur | data/places/natur/agder/skjernoy_kystkultur_lindesnes/skjernoy_kystkultur_lindesnes.json | 58.0008 | 7.5207 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| byremo_tingsted_lyngdal | Byremo tingsted Lyngdal | historie | data/places/historie/agder/byremo_tingsted_lyngdal/byremo_tingsted_lyngdal.json | 58.4182 | 7.3837 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| arendal_kulturhus | Arendal kulturhus | kunst | data/places/kunst/agder/arendal_kulturhus/arendal_kulturhus.json | 58.4607 | 8.7665 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| baneheia_kristiansand_bypark | Baneheia Kristiansand bypark | natur | data/places/natur/agder/baneheia_kristiansand_bypark/baneheia_kristiansand_bypark.json | 58.1518 | 7.9829 | 620 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| laudal_kraftverk_lindesnes | Laudal kraftverk Lindesnes | naeringsliv | data/places/naeringsliv/agder/laudal_kraftverk_lindesnes/laudal_kraftverk_lindesnes.json | 58.2695 | 7.5093 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| audnedal_stasjon_lyngdal | Audnedal stasjon Lyngdal | by | data/places/by/agder/audnedal_stasjon_lyngdal/audnedal_stasjon_lyngdal.json | 58.3238 | 7.354 | 420 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| rudskogen_motorsenter | Rudskogen Motorsenter | sport | data/places/sport/europa/norway/places_motorsport_ostlandet/rudskogen_motorsenter.json | 59.3759 | 11.2552 | 520 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| gardermoen_motorpark | Gardermoen Motorpark | sport | data/places/sport/europa/norway/places_motorsport_ostlandet/gardermoen_motorpark.json | 60.1832 | 11.1399 | 280 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| finnskogbanen | Finnskogbanen | sport | data/places/sport/europa/norway/places_motorsport_ostlandet/finnskogbanen.json | 60.4513 | 12.1864 | 260 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |
| etne_bmx_og_skatepark | Etne BMX- og skatepark | sport | data/places/sport/vestland/etne/etne_bmx_og_skatepark/etne_bmx_og_skatepark.json | 59.66795396985244 | 5.942168981207253 | 300 | Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote. |

### stasjon/park/gate/torg/elv uten coordinate metadata (58)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| kroderbanen_kroderen_stasjon | Krøderbanen / Krøderen stasjon | by | data/places/by/buskerud/kroderbanen_kroderen_stasjon/kroderbanen_kroderen_stasjon.json | 60.1359 | 9.7829 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| vikersund_stasjon_randsfjordbanen | Vikersund stasjon / Randsfjordbanen | by | data/places/by/buskerud/vikersund_stasjon_randsfjordbanen/vikersund_stasjon_randsfjordbanen.json | 59.9655 | 9.9986 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| raufoss_industripark_ammunisjon | Raufoss industripark / ammunisjonsfabrikken | naeringsliv | data/places/naeringsliv/innlandet/raufoss_industripark_ammunisjon/raufoss_industripark_ammunisjon.json | 60.7299 | 10.6164 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| elverum_folkehogskole_1940 | Elverum folkehøgskole / Elverumsfullmakten | politikk | data/places/politikk/innlandet/elverum_folkehogskole_1940/elverum_folkehogskole_1940.json | 60.8828 | 11.5599 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| hamar_stasjon_jernbanebyen | Hamar stasjon / jernbanebyen | by | data/places/by/innlandet/hamar_stasjon_jernbanebyen/hamar_stasjon_jernbanebyen.json | 60.7949 | 11.0678 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| koppangtunet_stor_elvdal | Koppangtunet / Stor-Elvdal museum | historie | data/places/historie/innlandet/places_historie_innlandet_batch9/koppangtunet_stor_elvdal.json | 61.5708 | 11.0552 | 320 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| mustad_hunnselva_gjovik | Mustad / Hunnselva industrimiljø | naeringsliv | data/places/naeringsliv/innlandet/mustad_hunnselva_gjovik/mustad_hunnselva_gjovik.json | 60.7894 | 10.6798 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| eina_stasjon_totenbanen | Eina stasjon / Totenbanen | by | data/places/by/innlandet/eina_stasjon_totenbanen/eina_stasjon_totenbanen.json | 60.6286 | 10.5988 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| espedalen_nikkelverk | Espedalen nikkelverk | naeringsliv | data/places/naeringsliv/innlandet/espedalen_nikkelverk/espedalen_nikkelverk.json | 61.4248 | 9.6036 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| fagernes_stasjon_valdresbanen | Fagernes stasjon / Valdresbanen | by | data/places/by/innlandet/fagernes_stasjon_valdresbanen/fagernes_stasjon_valdresbanen.json | 60.9856 | 9.2339 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lillehammer_stasjon | Lillehammer stasjon | by | data/places/by/innlandet/lillehammer_stasjon/lillehammer_stasjon.json | 61.1152 | 10.4637 | 280 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| dombas_stasjon_jernbaneknutepunkt | Dombås stasjon / jernbaneknutepunkt | by | data/places/by/innlandet/dombas_stasjon_jernbaneknutepunkt/dombas_stasjon_jernbaneknutepunkt.json | 62.0697 | 9.1239 | 320 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| otta_stasjon_gudbrandsdalen | Otta stasjon / Gudbrandsdalen | by | data/places/by/innlandet/otta_stasjon_gudbrandsdalen/otta_stasjon_gudbrandsdalen.json | 61.7712 | 9.5352 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kongsvinger_stasjon_grensebanen | Kongsvinger stasjon / grensebanen | by | data/places/by/innlandet/kongsvinger_stasjon_grensebanen/kongsvinger_stasjon_grensebanen.json | 60.1907 | 12.0007 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| elverum_stasjon_jernbanemiljo | Elverum stasjon / jernbanemiljø | by | data/places/by/innlandet/elverum_stasjon_jernbanemiljo/elverum_stasjon_jernbanemiljo.json | 60.8818 | 11.5621 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| tynset_stasjon_rorosbanen | Tynset stasjon / Rørosbanen | by | data/places/by/innlandet/tynset_stasjon_rorosbanen/tynset_stasjon_rorosbanen.json | 62.2757 | 10.7828 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| moelv_stasjon_mjoslinjen | Moelv stasjon / Mjøslinjen | by | data/places/by/innlandet/moelv_stasjon_mjoslinjen/moelv_stasjon_mjoslinjen.json | 60.9337 | 10.7005 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| stange_stasjon_dovrebanen | Stange stasjon / Dovrebanen | by | data/places/by/innlandet/stange_stasjon_dovrebanen/stange_stasjon_dovrebanen.json | 60.7181 | 11.1941 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| gran_stasjon_gjovikbanen | Gran stasjon / Gjøvikbanen | by | data/places/by/innlandet/gran_stasjon_gjovikbanen/gran_stasjon_gjovikbanen.json | 60.3665 | 10.5608 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lena_stasjon_totenbanen | Lena stasjon / Totenbanen | by | data/places/by/innlandet/lena_stasjon_totenbanen/lena_stasjon_totenbanen.json | 60.6744 | 10.8138 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| reinsvoll_stasjon_totenbanen | Reinsvoll stasjon / Totenbanen | by | data/places/by/innlandet/reinsvoll_stasjon_totenbanen/reinsvoll_stasjon_totenbanen.json | 60.6798 | 10.6225 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| dokka_stasjon_valdresbanen | Dokka stasjon / Valdresbanen | by | data/places/by/innlandet/dokka_stasjon_valdresbanen/dokka_stasjon_valdresbanen.json | 60.8352 | 10.0719 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| skarnes_stasjon_kongsvingerbanen | Skarnes stasjon / Kongsvingerbanen | by | data/places/by/innlandet/skarnes_stasjon_kongsvingerbanen/skarnes_stasjon_kongsvingerbanen.json | 60.2536 | 11.6819 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| skreia_stasjon_totenbanen | Skreia stasjon / Totenbanen | by | data/places/by/innlandet/skreia_stasjon_totenbanen/skreia_stasjon_totenbanen.json | 60.6504 | 10.9357 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| flisa_stasjon_solorbanen | Flisa stasjon / Solørbanen | by | data/places/by/innlandet/flisa_stasjon_solorbanen/flisa_stasjon_solorbanen.json | 60.6095 | 12.0116 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| os_stasjon_rorosbanen | Os stasjon / Rørosbanen | by | data/places/by/innlandet/os_stasjon_rorosbanen/os_stasjon_rorosbanen.json | 62.4957 | 11.2235 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| borrerhaugene_midgard | Borreparken / Borre-haugene | historie | data/places/historie/vestfold/places_historie_vestfold_batch1/borrerhaugene_midgard.json | 59.3805 | 10.4686 | 620 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| horten_stasjon_vestfoldbanen | Horten stasjon / Vestfoldbanen | by | data/places/by/vestfold/horten_stasjon_vestfoldbanen/horten_stasjon_vestfoldbanen.json | 59.4129 | 10.4825 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| tonsberg_stasjon_vestfoldbanen | Tønsberg stasjon / Vestfoldbanen | by | data/places/by/vestfold/tonsberg_stasjon_vestfoldbanen/tonsberg_stasjon_vestfoldbanen.json | 59.2709 | 10.4121 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| sandefjord_stasjon_vestfoldbanen | Sandefjord stasjon / Vestfoldbanen | by | data/places/by/vestfold/sandefjord_stasjon_vestfoldbanen/sandefjord_stasjon_vestfoldbanen.json | 59.1317 | 10.2244 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| larvik_stasjon_vestfoldbanen | Larvik stasjon / Vestfoldbanen | by | data/places/by/vestfold/larvik_stasjon_vestfoldbanen/larvik_stasjon_vestfoldbanen.json | 59.0525 | 10.0352 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| brekkeparken_skien | Brekkeparken Skien | historie | data/places/historie/telemark/places_historie_telemark_batch1/brekkeparken_skien.json | 59.2072 | 9.6005 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| rjukanbanen_rjukan_stasjon | Rjukanbanen / Rjukan stasjon | by | data/places/by/telemark/rjukanbanen_rjukan_stasjon/rjukanbanen_rjukan_stasjon.json | 59.8789 | 8.5927 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| tinnoset_stasjon_tinnosbanen | Tinnoset stasjon / Tinnosbanen | by | data/places/by/telemark/tinnoset_stasjon_tinnosbanen/tinnoset_stasjon_tinnosbanen.json | 59.7048 | 9.0362 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| mael_stasjon_rjukanbanen | Mæl stasjon / Rjukanbanen | by | data/places/by/telemark/mael_stasjon_rjukanbanen/mael_stasjon_rjukanbanen.json | 59.8842 | 8.7526 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| notodden_stasjon_industriarv | Notodden stasjon / industriarv | by | data/places/by/telemark/notodden_stasjon_industriarv/notodden_stasjon_industriarv.json | 59.5602 | 9.2601 | 320 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| heroya_industripark_porsgrunn | Herøya industripark | naeringsliv | data/places/naeringsliv/telemark/heroya_industripark_porsgrunn/heroya_industripark_porsgrunn.json | 59.1117 | 9.6405 | 520 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kragero_stasjon_kragerobanen | Kragerø stasjon / Kragerøbanen | by | data/places/by/telemark/kragero_stasjon_kragerobanen/kragero_stasjon_kragerobanen.json | 58.8699 | 9.4107 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| treungen_stasjon_treungenbanen | Treungen stasjon / Treungenbanen | by | data/places/by/telemark/treungen_stasjon_treungenbanen/treungen_stasjon_treungenbanen.json | 59.0215 | 8.5215 | 320 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| bo_stasjon_sorlandsbanen | Bø stasjon / Sørlandsbanen | by | data/places/by/telemark/bo_stasjon_sorlandsbanen/bo_stasjon_sorlandsbanen.json | 59.4128 | 9.066 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| nelaug_stasjon_amli | Nelaug stasjon Åmli | by | data/places/by/agder/nelaug_stasjon_amli/nelaug_stasjon_amli.json | 58.6592 | 8.6318 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| kristiansand_stasjon | Kristiansand stasjon | by | data/places/by/agder/kristiansand_stasjon/kristiansand_stasjon.json | 58.1457 | 7.9875 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lista_flystasjon_farsund | Lista flystasjon Farsund | by | data/places/by/agder/lista_flystasjon_farsund/lista_flystasjon_farsund.json | 58.099 | 6.626 | 620 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| arendal_stasjon | Arendal stasjon | by | data/places/by/agder/arendal_stasjon/arendal_stasjon.json | 58.4619 | 8.7723 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| grimstad_stasjon_grimstadbanen | Grimstad stasjon / Grimstadbanen | by | data/places/by/agder/grimstad_stasjon_grimstadbanen/grimstad_stasjon_grimstadbanen.json | 58.342 | 8.5938 | 360 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| tingvatn_fornminnepark_haegebostad | Tingvatn fornminnepark Hægebostad | historie | data/places/historie/agder/tingvatn_fornminnepark_haegebostad/tingvatn_fornminnepark_haegebostad.json | 58.3752 | 7.2049 | 520 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| furulunden_mandal_kulturpark | Furulunden Mandal kulturpark | natur | data/places/natur/agder/furulunden_mandal_kulturpark/furulunden_mandal_kulturpark.json | 58.0207 | 7.4525 | 620 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| setesdal_mineralpark_evje | Setesdal mineralpark Evje | vitenskap | data/places/vitenskap/agder/setesdal_mineralpark_evje/setesdal_mineralpark_evje.json | 58.5949 | 7.7867 | 460 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| baneheia_kristiansand_bypark | Baneheia Kristiansand bypark | natur | data/places/natur/agder/baneheia_kristiansand_bypark/baneheia_kristiansand_bypark.json | 58.1518 | 7.9829 | 620 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| audnedal_stasjon_lyngdal | Audnedal stasjon Lyngdal | by | data/places/by/agder/audnedal_stasjon_lyngdal/audnedal_stasjon_lyngdal.json | 58.3238 | 7.354 | 420 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| gardermoen_motorpark | Gardermoen Motorpark | sport | data/places/sport/europa/norway/places_motorsport_ostlandet/gardermoen_motorpark.json | 60.1832 | 11.1399 | 280 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| selhurst_park_london | Selhurst Park | sport | data/places/sport/europa/england/footballgrounds_london/selhurst_park_london.json | 51.3983 | -0.0855 | 190 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lisbon_maat | MAAT / Tejo-kraftstasjonen | kunst | data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst/lisbon_maat.json | 38.6953 | -9.1937 | 200 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lisbon_terminal_de_cruzeiros | Terminal de Cruzeiros de Lisboa | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_terminal_de_cruzeiros.json | 38.7142 | -9.1242 | 200 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| lisbon_santa_apolonia_station | Santa Apolónia Station | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv/lisbon_santa_apolonia_station.json | 38.714 | -9.1228 | 180 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| etnesjoen_torg_og_kai | Etnesjøen torg og kai | by | data/places/by/vestland/etne/etnesjoen_torg_og_kai/etnesjoen_torg_og_kai.json | 59.66489494369154 | 5.934465720587056 | 260 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| etne_bmx_og_skatepark | Etne BMX- og skatepark | sport | data/places/sport/vestland/etne/etne_bmx_og_skatepark/etne_bmx_og_skatepark.json | 59.66795396985244 | 5.942168981207253 | 300 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |
| skanevik_skatepark | Skånevik skatepark | sport | data/places/sport/vestland/etne/skanevik_skatepark/skanevik_skatepark.json | 59.73 | 5.92 | 220 | Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote. |

### svært liten r (<60 m) for sted som ser utstrakt ut (11)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| norges_bank_bankplassen_4 | Norges Bank – Bankplassen 4 | naeringsliv | data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04/norges_bank_bankplassen_4.json | 59.90866481462448 | 10.741285328997623 | 55 | Navn/kategori tyder på park/gate/elv/område/rute/plass; vurder større r eller anchors. |
| bla_skilt_helverschous_lokke_munkedamsveien_35 | Blått skilt: Helverschous løkke | historie | data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01/bla_skilt_helverschous_lokke_munkedamsveien_35.json | 59.911785794838465 | 10.7259247905869 | 35 | Navn/kategori tyder på park/gate/elv/område/rute/plass; vurder større r eller anchors. |
| galleri_schaeffers_gate_5 | Galleri Schaeffers Gate 5 | kunst | data/places/kunst/oslo/places_kunst/galleri_schaeffers_gate_5.json | 59.92127390279403 | 10.762304822006952 | 50 | Navn/kategori tyder på park/gate/elv/område/rute/plass; vurder større r eller anchors. |
| sofienbergparken_gjenvinningsstasjon | Sofienbergparken gjenvinningsstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/sofienbergparken_gjenvinningsstasjon.json | 59.923564 | 10.7656953 | 55 | Navn/kategori tyder på park/gate/elv/område/rute/plass; vurder større r eller anchors. |
| lesekiosk_22_vigelandsparken | Lesekiosk 22 – Vigelandsparken | litteratur | data/places/litteratur/oslo/lesekiosk/lesekiosk_22_vigelandsparken.json | 59.9262575 | 10.7031905 | 45 | Navn/kategori tyder på park/gate/elv/område/rute/plass; vurder større r eller anchors. |
| lesekiosk_42_munkedamsveien | Lesekiosk 42 – Munkedamsveien | litteratur | data/places/litteratur/oslo/lesekiosk/lesekiosk_42_munkedamsveien.json | 59.9122394 | 10.7272333 | 45 | Navn/kategori tyder på park/gate/elv/område/rute/plass; vurder større r eller anchors. |
| lesekiosk_56_vestgrensa_2 | Lesekiosk 56 – John Colletts plass | litteratur | data/places/litteratur/oslo/lesekiosk/lesekiosk_56_vestgrensa_2.json | 59.9411528 | 10.7296172 | 45 | Navn/kategori tyder på park/gate/elv/område/rute/plass; vurder større r eller anchors. |
| lesekiosk_1_solli_plass | Lesekiosk 1 – Solli plass | litteratur | data/places/litteratur/oslo/lesekiosk/lesekiosk_1_solli_plass.json | 59.9150102 | 10.7179623 | 45 | Navn/kategori tyder på park/gate/elv/område/rute/plass; vurder større r eller anchors. |
| lesekiosk_78_olav_kyrres_plass | Lesekiosk 78 – Olav Kyrres plass | litteratur | data/places/litteratur/oslo/lesekiosk/lesekiosk_78_olav_kyrres_plass.json | 59.9192766 | 10.6945543 | 45 | Navn/kategori tyder på park/gate/elv/område/rute/plass; vurder større r eller anchors. |
| mosseveien_miljostasjon | Mosseveien miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/mosseveien_miljostasjon.json | 59.880436134678 | 10.773377511603 | 45 | Navn/kategori tyder på park/gate/elv/område/rute/plass; vurder større r eller anchors. |
| tveita_miljostasjon | Tveita miljøstasjon | natur | data/places/natur/oslo/miljo_gjenbruk/tveita_miljostasjon.json | 59.916287307096 | 10.847120089516 | 45 | Navn/kategori tyder på park/gate/elv/område/rute/plass; vurder større r eller anchors. |

### identisk/nesten identisk lat/lon som annet sted uten forklaring (10)

| id | name | category | fil | lat | lon | r | Foreslått manuell handling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lisbon_panteao_nacional | Panteão Nacional (Igreja de Santa Engrácia) | historie | data/places/historie/europe/portugal/lisbon/places_lisbon_historie/lisbon_panteao_nacional.json | 38.7155 | -9.1244 | 150 | Deler punkt med: lisbon_feira_da_ladra. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| lisbon_feira_da_ladra | Feira da Ladra | naeringsliv | data/places/naeringsliv/europe/portugal/lisbon/lisbon_feira_da_ladra.json | 38.7155 | -9.1244 | 250 | Deler punkt med: lisbon_panteao_nacional. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| lisbon_cinema_sao_jorge | Cinema São Jorge | film_tv | data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_cinema_sao_jorge.json | 38.7202 | -9.1463 | 100 | Deler punkt med: lisbon_doclisboa. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| lisbon_doclisboa | Doclisboa – Festival Internacional de Cinema | film_tv | data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv/lisbon_doclisboa.json | 38.7202 | -9.1463 | 250 | Deler punkt med: lisbon_cinema_sao_jorge. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| skanevik_hermetikkfabrikk | Skånevik hermetikkfabrikk | naeringsliv | data/places/naeringsliv/vestland/etne/skanevik_hermetikkfabrikk/skanevik_hermetikkfabrikk.json | 59.73128737155455 | 5.92525891571817 | 280 | Deler punkt med: skanevik_gjestgjevargarden. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| skanevik_ferjekai | Skånevik ferjekai | by | data/places/by/vestland/etne/skanevik_ferjekai/skanevik_ferjekai.json | 59.7334 | 5.9327 | 220 | Deler punkt med: folgefonden_minnesmerke_skanevik. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| etnesjoen_torg_og_kai | Etnesjøen torg og kai | by | data/places/by/vestland/etne/etnesjoen_torg_og_kai/etnesjoen_torg_og_kai.json | 59.66489494369154 | 5.934465720587056 | 260 | Deler punkt med: ingvar_moe_byste_etne, etne_tinghus. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| ingvar_moe_byste_etne | Ingvar Moe-bysten i Etne | litteratur | data/places/litteratur/vestland/etne/ingvar_moe_byste_etne/ingvar_moe_byste_etne.json | 59.66489494369154 | 5.934465720587056 | 120 | Deler punkt med: etnesjoen_torg_og_kai, etne_tinghus. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| etne_bmx_og_skatepark | Etne BMX- og skatepark | sport | data/places/sport/vestland/etne/etne_bmx_og_skatepark/etne_bmx_og_skatepark.json | 59.66795396985244 | 5.942168981207253 | 300 | Deler punkt med: etne_tennisanlegg. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |
| etne_tennisanlegg | Etne tennisanlegg | sport | data/places/sport/vestland/etne/etne_tennisanlegg/etne_tennisanlegg.json | 59.66795396985244 | 5.942168981207253 | 220 | Deler punkt med: etne_bmx_og_skatepark. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote. |

## Anbefalt kommando
- `node tools/place-coordinate-quality-gate.mjs`
